import conf from "../conf/conf.js";
import { Client, ID, Databases, Storage, Query } from "appwrite";

export class Service {
  client = new Client();
  databases;
  bucket;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  async createPost({ title, content, featuredImage, status, userId }) {
    try {
      const post = await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        ID.unique(),
        {
          title,
          content,
          featuredImage,
          status,
          userId,
        }
      );
      // Return the post including the created timestamp
      return {
        ...post,
        created: post.$createdAt,
      };
    } catch (error) {
      throw error;
    }
  }

  async updatePost(id, { title, content, featuredImage, status }) {
    try {
      const updatedPost = await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        id,
        {
          title,
          content,
          featuredImage,
          status,
        }
      );
      // Return the updated post including updated timestamp
      return {
        ...updatedPost,
        updated: updatedPost.$updatedAt,
      };
    } catch (error) {
      throw error;
    }
  }

  async deletePost(id) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        id
      );
      return true;
    } catch (error) {
      throw error;
      return false;
    }
  }

  async getPost(id) {
    try {
      const post = await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        id
      );
      // Return the post including created and updated timestamps
      return {
        ...post,
        created: post.$createdAt,
        updated: post.$updatedAt,
      };
    } catch (error) {
      throw error;
      return false;
    }
  }

  async getPosts(queries = [Query.equal("status", "active")]) {
    try {
      const response = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        queries
      );
      // Return all posts with created and updated timestamps
      const posts = response.documents.map((post) => ({
        ...post,
        created: post.$createdAt,
        updated: post.$updatedAt,
      }));
      return {
        documents: posts,
      };
    } catch (error) {
      throw error;
      return false;
    }
  }

  // File upload service

  async uploadFile(file) {
    try {
      return await this.bucket.createFile(
        conf.appwriteBucketId,
        ID.unique(),
        file
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
      return true;
    } catch (error) {
      throw error;
      return false;
    }
  }

  getFilePreview(fileId) {
    return this.bucket.getFilePreview(conf.appwriteBucketId, fileId);
  }
}

const service = new Service();
export default service;
