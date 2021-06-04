const Campground = require('../models/campground');
const Image = require('../models/image');
const {cloudinary} = require('../cloudinary');
const {geocoder} = require('../mapbox');
const {successRedirect} = require('../utils/redirectHandlers');

const viewPath = (fileName) => `campgrounds/${fileName}`;

const indexUrl = '/campgrounds';
const detailUrl = (id) => `/campgrounds/${ id }`;


const successMsg = {
  CREATE_SUCCESS: 'Successfully made a new campground!',
  UPDATE_SUCCESS: 'Successfully update the campground!',
  DELETE_SUCCESS: 'Successfully deleted the campground!',
};

const shownIndex = async (req, res) => {
  const {currentSort} = res.sortResult;
  const params = {...res.paginatedResult, currentSort};
  res.render(viewPath('index'), params);
};

const renderNewForm = (req, res) => {
  res.render(viewPath('new'));
};

const renderEditForm = async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id).populate('images');
  res.render(viewPath('edit'), {campground});
};

const createCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  const images = req.files
      .map((f) => new Image({url: f.path, filename: f.filename}));
  const geoData = await geocoder.forwardGeocode({
    query: campground.location,
    limit: 1,
  }).send();

  campground.geometry = geoData.body.features[0].geometry;
  campground.images.push(...images);
  campground.author = req.user._id;
  await Image.insertMany(images);
  await campground.save();
  successRedirect(
      req,
      res,
      successMsg.CREATE_SUCCESS,
      detailUrl(campground._id),
  );
};

const showCampground = async (req, res) => {
  const {id} = req.params;
  const campground = await Campground
      .findById(id)
      .populate('images', 'url')
      .populate({
        path: 'reviews',
        populate: {
          path: 'author',
        },
      })
      .populate('author');

  res.render(viewPath('show'), {campground});
};

const updateCampground = async (req, res) => {
  const {id} = req.params;
  const campground = await Campground
      .findByIdAndUpdate(id, {...req.body.campground})
      .populate('images');
  const images = req.files
      .map((f) => new Image({url: f.path, filename: f.filename}));
  campground.images.push(...images);
  await images.map( (img) => (img.save()) );
  await campground.save();
  deleteImgIds = req.body.deleteImgIds;
  if (deleteImgIds) {
    await campground.updateOne({$pull: {images: {$in: deleteImgIds}}});
    // No need to wait following executions.
    // Delete in Mongo.
    Image.deleteMany({_id: {$in: deleteImgIds}});
    fileNames = Image.find({_id: {$in: deleteImgIds}});
    // Delete in Cloudinary.
    fileNames.map( (fn) => cloudinary.uploader.destroy(fn) );
  }
  successRedirect(
      req,
      res,
      successMsg.UPDATE_SUCCESS,
      detailUrl(campground._id),
  );
};

const deleteCampground = async (req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  successRedirect(req, res, successMsg.DELETE_SUCCESS, indexUrl);
};

module.exports = {
  shownIndex,
  renderNewForm,
  renderEditForm,
  createCampground,
  showCampground,
  updateCampground,
  deleteCampground,
};
