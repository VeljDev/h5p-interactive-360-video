/*
 * Based on H5P Interactive Video presave logic
 * Copyright (c) 2012-2014 Joubel AS
 * Copyright (c) 2017 H5P
 * Modifications for Interactive 360 Video
 * Copyright (c) 2025 Veljko Markovic, Lorenzo Sommaruga
 */
var H5PPresave = H5PPresave || {};
var H5PEditor = H5PEditor || {};


/**
 * Function to go through all elements of a Course Presentation and perform the separate calculations before returning a aggregated result
 *
 * @param {object} content
 * @param finished
 * @constructor
 */
H5PPresave['H5P.Interactive360Video'] = function (content, finished) {
  var presave = H5PEditor.Presave;

  if (isContentInvalid()) {
    throw new presave.exceptions.InvalidContentSemanticsException('Invalid Interactive 360 Video Error');
  }

  var librariesToCheck = [].concat(content.interactive360Video.assets.interactions);

  if (hasSummary()) {
    librariesToCheck.push({action: content.interactive360Video.summary.task});
  }

  var score = librariesToCheck
    .map(function (element) {
      if (element.hasOwnProperty('action')) {
        return element.action;
      }
      return {};
    })
    .filter(function (action) {
      return action.hasOwnProperty('library') && action.hasOwnProperty('params');
    })
    .map(function (action) {
      return (new presave).process(action.library, action.params).maxScore;
    })
    .reduce(function (currentScore, scoreToAdd) {
      if (presave.isInt(scoreToAdd)) {
        currentScore += scoreToAdd;
      }
      return currentScore;
    }, 0);

  presave.validateScore(score);

  finished({maxScore: score});

  /**
   * Check if required parameters is present
   * @return {boolean}
   */
  function isContentInvalid() {
    return !presave.checkNestedRequirements(content, 'content.interactive360Video.assets.interactions') || !Array.isArray(content.interactive360Video.assets.interactions);
  }

  /**
   * Check if required summary is present
   * @return {boolean}
   */
  function hasSummary() {
    return presave.checkNestedRequirements(content, 'content.interactive360Video.summary.task.library') && presave.checkNestedRequirements(content, 'content.interactive360Video.summary.task.params');
  }

};
