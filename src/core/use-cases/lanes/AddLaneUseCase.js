// core/use-cases/lanes/AddLaneUseCase.js
import { Lane } from "../../entities/Lane.js";

export class AddLaneUseCase {
  constructor(laneRepository, postRepository, validator) {
    this.laneRepository = laneRepository;
    this.postRepository = postRepository;
    this.validator = validator;
  }

  async execute(subreddit) {
    try {
      console.log(`➕ Adding lane for r/${subreddit}`);

      // گرفتن پست‌ها از سابردیت
      const posts = await this.postRepository.fetchPosts(subreddit, 10);

      // ایجاد lane جدید
      const lane = new Lane({
        id: this.generateId(),
        subreddit: subreddit,
        posts: posts,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // ذخیره lane
      await this.laneRepository.save(lane);

      console.log(
        `✅ Lane created for r/${subreddit} with ${posts.length} posts`
      );

      return {
        success: true,
        lane: lane,
      };
    } catch (error) {
      console.error(`❌ Failed to add lane for r/${subreddit}:`, error);
      throw new Error(`Failed to add r/${subreddit}: ${error.message}`);
    }
  }

  generateId() {
    return "lane_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }
}
