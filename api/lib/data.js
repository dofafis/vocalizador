/*
 * Library for storing and editing data
 *
 */

// Dependencies
var fs = require('fs');
var path = require('path');
var knex = require('./knex');
var helpers = require('./helpers');

// Container for module (to be exported)
var lib = {};

// Inserindo dados
lib.insert = function(table, data, callback) {
  var consulta = knex(table).insert(data);
  consulta
  .then(function(){
    callback(false);
  })
  .catch(function(err){
    callback(err);
  });
};

// Select por um campo
lib.selectByField = function(table, data, callback) {
  var consulta = knex.from(table).select('*').where(data);
  consulta
    .then(function(results){
      callback(false, results);
    })
    .catch(function(err){
      callback(err, false);
    });
};

// Alterar um conjunto de campos
lib.update = function(table, id, newData, callback) {
  var consulta = knex(table).where(id).update(newData);
  consulta
    .then(function(){
      callback(false);
    })
    .catch(function(err){
      callback(err);
    });
};

lib.delete = function(table, id, callback) {
  var consulta = knex(table).where(id).del();
  consulta
    .then(function(){
      callback(false);
    })
    .catch(function(err){
      callback(err);
    });
};


// Export the module
module.exports = lib;
