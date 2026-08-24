import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDistrict {
  ad: string;
  slug: string;
}

export interface ILocation extends Document {
  il: string;
  ilSlug: string;
  ilceler: IDistrict[];
}

const DistrictSchema = new Schema<IDistrict>({
  ad: { type: String, required: true },
  slug: { type: String, required: true },
});

const LocationSchema = new Schema<ILocation>(
  {
    il: { type: String, required: true, unique: true },
    ilSlug: { type: String, required: true, unique: true, index: true },
    ilceler: [DistrictSchema],
  },
  { timestamps: true }
);

const LocationModel: Model<ILocation> =
  mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);

export default LocationModel;
