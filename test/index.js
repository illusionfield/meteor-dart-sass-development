// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by meteor-scss-autoprefixer.js.
import { name as packageName } from "meteor/meteor-scss-autoprefixer";

// Write your tests here!
// Here is an example.
Tinytest.add('meteor-scss-autoprefixer - example', function (test) {
  test.equal(packageName, "meteor-scss-autoprefixer");
});
