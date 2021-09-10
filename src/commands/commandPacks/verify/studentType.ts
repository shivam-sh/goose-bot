import { ObjectId } from 'bson';

export interface Student {
  _id: ObjectId;
  watID: string;
  emails: string[];
  verified: boolean;
  verifiedBy: string;
  token: string;
}
