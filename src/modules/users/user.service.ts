import { PipelineStage, Types } from "mongoose";
import { AppError } from "../../utils/app-error";
import { PostModel } from "../posts/post.model";
import { UpdateProfileInput } from "./user.schema";
import { UserModel } from "./user.model";

export async function updateProfile(userId: string, patch: UpdateProfileInput) {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: patch },
    { new: true, runValidators: true },
  );
  if (!user) throw new AppError(404, "User not found");
  return user;
}

// Scenario 1: users grouped by interest, one aggregate() call
export async function groupUsersByInterest(opts: {
  interest?: string;
  skip: number;
  limit: number;
}) {
  const { interest, skip, limit } = opts;
  const pipeline: PipelineStage[] = [];

  // when filtering, the first $match is served by the interests index
  if (interest) pipeline.push({ $match: { interests: interest } });
  pipeline.push({ $unwind: "$interests" });
  if (interest) pipeline.push({ $match: { interests: interest } });

  pipeline.push(
    {
      $group: {
        _id: "$interests",
        count: { $sum: 1 },
        users: { $push: { _id: "$_id", name: "$name" } },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    {
      // pagination and total count inside the same single aggregate call
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              interest: "$_id",
              count: 1,
              users: { $slice: ["$users", 20] },
            },
          },
        ],
        total: [{ $count: "n" }],
      },
    },
  );

  const [result] = await UserModel.aggregate(pipeline);
  return { items: result.data, total: (result.total[0]?.n as number) ?? 0 };
}

// Scenario 2: all posts of one user, single pipeline with $lookup
export async function getUserWithPosts(userId: string, skip: number, limit: number) {
  const [result] = await UserModel.aggregate([
    { $match: { _id: new Types.ObjectId(userId) } },
    {
      $lookup: {
        from: PostModel.collection.name,
        localField: "_id",
        foreignField: "author",
        pipeline: [
          { $sort: { _id: -1 } },
          { $skip: skip },
          { $limit: limit },
          { $project: { title: 1, body: 1, createdAt: 1 } },
        ],
        as: "posts",
      },
    },
    { $project: { name: 1, interests: 1, posts: 1 } },
  ]);

  if (!result) throw new AppError(404, "User not found");

  const total = await PostModel.countDocuments({ author: new Types.ObjectId(userId) });
  return { user: result, total };
}