import { Post } from "../entities/Post";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import { createWriteStream, unlink } from "fs";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 50);
  }

  @FieldResolver(() => String)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { req, updootLoader }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { postId, userId } });

    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `update updoot
        set value = $1
        where "postId" = $2 and "userId" = $3`,
          [realValue, postId, userId]
        );

        await tm.query(
          `update post
        set points = points + $1
        where id = $2`,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `insert into updoot ("userId", "postId", value)
        values ($1,$2,$3)`,
          [userId, postId, realValue]
        );

        await tm.query(
          `update post
        set points = points + $1
        where id = $2`,
          [realValue, postId]
        );
      });
    }
    /* await Updoot.insert({
      userId,
      postId,
      value: realValue,
    }); */

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() {}: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = Math.min(50, limit) + 1;
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .orderBy("p.createdAt", "DESC")
      .take(realLimitPlusOne);

    if (cursor) {
      qb.where("p.createdAt < :cursor", {
        cursor: new Date(parseInt(cursor)),
      });
    }

    const posts = await qb.getMany();
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("image", () => GraphQLUpload, { nullable: true })
    image: FileUpload | null,
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    const post = await Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();

    if (image) {
      await new Promise(async (resolve) =>
        image
          .createReadStream()
          .pipe(createWriteStream(`./public/images/${image.filename}`))
          .on("finish", async () => {
            post.image = `http://localhost:${process.env.BACKEND_PORT}/images/${image.filename}`;
            await post.save();
            resolve(true);
          })
          .on("error", () => {
            resolve(false);
          })
      );
    }
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("image", () => GraphQLUpload, { nullable: true })
    image: FileUpload | null,
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    const splitArray = result.raw[0].image?.split("/");
    if (splitArray) {
      unlink(`./public/images/${splitArray[splitArray.length - 1]}`, () => {});
    }
    if (image) {
      await new Promise(async (resolve) =>
        image
          .createReadStream()
          .pipe(createWriteStream(`./public/images/${image.filename}`))
          .on("finish", async () => {
            result.raw[0].image = `http://localhost:${process.env.BACKEND_PORT}/images/${image.filename}`;
            await Post.save(result.raw[0]);
            resolve(true);
          })
          .on("error", () => {
            resolve(false);
          })
      );
    }
    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    // not cascade way
    /* const post = await Post.findOne(id);
    if (!post) {
      return false;
    }
    if (post.creatorId !== req.session.userId) {
      throw new Error("not authorized");
    }
    await Updoot.delete({ postId: id });
    await Post.delete({ id }); */
    const post = await Post.findOne(id);
    const splitArray = post?.image.split("/");
    if (splitArray) {
      unlink(
        `./public/images/${splitArray[splitArray.length - 1]}`,
        async () => {
          await Post.delete({ id, creatorId: req.session.userId });
        }
      );
    }
    return true;
  }
}
