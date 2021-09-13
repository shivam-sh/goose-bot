import { ObjectID } from 'bson';

export interface GuildConfig {
  _id: ObjectID;
  adminRole: string;
  verifiedRole: string;
}
