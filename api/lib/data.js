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
  .then(function(result){
    callback(result, false);
  })
  .catch(function(err){
    callback(false, err);
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

lib.moverArquivo = function(nome, arquivo, novoCaminho, callback) {

  var origem = fs.createReadStream(arquivo.path);
  var destino = fs.createWriteStream(novoCaminho + nome);

  origem.pipe(destino);

  origem.on('end', function() {
    callback(false);
  });

  origem.on('error', function(err) {
    callback({'Error': 'Não foi possível fazer o upload do arquivo'});
  });

};

// Export the module
module.exports = lib;
