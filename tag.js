"use strict";

let Tag = {
  init() {
    this.tags = [];
    return this;
  },
  parseTags(tagsArray) {
    return tagsArray.reduce((acc, val) => {
      if (val) {
        val.split(',').forEach(tag => {
          if (acc[tag]) {
            acc[tag] += 1;
          } else {
            acc[tag] = 1;
          }
        });
      }
      return acc;
    }, {});
  },
  createNewTags(tagsArray) {
    let splitTags = this.parseTags(tagsArray);

    let result = [];
    Object.keys(splitTags).forEach(tag => {
      let obj = { name: tag, frequency: splitTags[tag] };
      result.push(obj);
    });

    this.tags = result;
  },
  getAllTags() {
    return this.tags;
  }
}