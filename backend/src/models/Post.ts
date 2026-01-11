import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export type PostType = 'project' | 'hackathon' | 'internship';

export interface IPost extends Document {
    _id: mongoose.Types.ObjectId;
    type: PostType;
    title: string;
    description: string;
    tags: string[];
    author: mongoose.Types.ObjectId | IUser;
    likes: number;
    comments: number;
    createdAt: Date;
}

const postSchema = new Schema<IPost>(
    {
        type: {
            type: String,
            enum: ['project', 'hackathon', 'internship'],
            required: [true, 'Post type is required'],
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator: function (v: string[]) {
                    return v.length <= 5;
                },
                message: 'Cannot have more than 5 tags',
            },
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Author is required'],
        },
        likes: {
            type: Number,
            default: 0,
        },
        comments: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Populate author by default
postSchema.pre(/^find/, function (next) {
    (this as mongoose.Query<IPost[], IPost>).populate({
        path: 'author',
        select: 'name email role avatar createdAt',
    });
    next();
});

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
