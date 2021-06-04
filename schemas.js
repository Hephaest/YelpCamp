const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include HTML!',
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value) return helpers.error('string.escapeHTML', {value});
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

const campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().escapeHTML().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().escapeHTML().max(60).required(),
    description: Joi.string().escapeHTML().max(1000).required(),
  }).required(),
  deleteImgIds: Joi.array(),
});

const reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().escapeHTML().min(3).max(400).required(),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
});

module.exports = {campgroundSchema, reviewSchema};
