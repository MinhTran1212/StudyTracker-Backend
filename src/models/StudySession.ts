import { Schema, model, Document } from 'mongoose';

export interface IStudySession extends Document {
    userId: Schema.Types.ObjectId;
    subjectId: Schema.Types.ObjectId,
    duration: number,
    notes: string,
    createdAt: Date;
}

const StudySessionSchema = new Schema<IStudySession>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    subjectId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Subject'
    },
    duration: {
        type: Number,
        required: true
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const StudySession = model<IStudySession>('StudySession', StudySessionSchema);