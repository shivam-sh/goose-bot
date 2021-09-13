import { ObjectID } from 'bson';

export interface Student {
  _id: ObjectID;
  watID: string;
  emails: string[];
  verified: boolean;
  verifiedBy: string;
  token: string;
}

export function StudentObject(id: ObjectID, watIAM: string, verified = false, verificationMethod = ''): Student {
  return {
    _id: id,
    watID: watIAM,
    emails: [watIAM + '@uwaterloo.ca'],
    verified: verified,
    verifiedBy: verificationMethod,
    token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
  } as Student;
}
