import * as Yup from "yup";

const common = {
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
};

export const adminRegisterSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  ...common,
});

export const adminLoginSchema = Yup.object({
  ...common,
});

export const albumFormSchema = Yup.object({
  name: Yup.string().min(2, "Name is required").required("Name is required"),
  genre: Yup.string().min(2, "Genre is required").required("Genre is required"),
  language: Yup.string()
    .min(2, "Language is required")
    .required("Language is required"),
  description: Yup.string(),
  releaseDate: Yup.string().required("Release date is required"),
  artists: Yup.array()
    .of(Yup.string().min(1))
    .min(1, "At least one artist is required")
    .required("Artists are required"),
  coverImage: Yup.mixed().required("Cover image is required"),
});

export const artistSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  bio: Yup.string(),
  country: Yup.string(),
  socialLinks: Yup.object({
    youtube: Yup.string().url("Invalid URL"),
    instagram: Yup.string().url("Invalid URL"),
    twitter: Yup.string().url("Invalid URL"),
    facebook: Yup.string().url("Invalid URL"),
  }),
  image: Yup.mixed().required("Image is required"),
});
