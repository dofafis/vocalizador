/*
 * Request Handlers
 *
 */

// Dependencies
var fs = require('fs');
var glob = require('glob');
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');

// Define all the handlers
var handlers = {};

// Ping
handlers.ping = function(data,callback){
  setTimeout(function(){
    callback(200);
  },5000);

};

// Not-Found
handlers.notFound = function(data,callback){
  callback(404);
};

// usuarios
handlers.usuarios = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._usuarios[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the usuarios methods
handlers._usuarios  = {};

// Usuarios - post
// Dados obrigatórios: nome, sobrenome, login, senha, email, adm
// Optional data: none
handlers._usuarios.post = function(data,callback){
  // Check that all required fields are filled out
  var nome = typeof(data.payload.nome) == 'string' && data.payload.nome.trim().length > 0 ? data.payload.nome.trim() : false;
  var sobrenome = typeof(data.payload.sobrenome) == 'string' && data.payload.sobrenome.trim().length > 0 ? data.payload.sobrenome.trim() : false;
  var login = typeof(data.payload.login) == 'string' && data.payload.login.trim().length > 0 ? data.payload.login.trim() : false;
  var senha = typeof(data.payload.senha) == 'string' && data.payload.senha.trim().length > 0 ? data.payload.senha.trim() : false;
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().indexOf('@') != -1 ? data.payload.email.trim() : false;
  var adm = typeof(data.payload.adm) == 'string' && data.payload.adm.toString().trim() === 'ldc2396' ? true : false;

  if(nome && sobrenome && login && senha && email){


    // Make sure the user doesnt already exist
    _data.selectByField('usuario', {'login': login}, function(err, results){
      if(!err && results){
        if(results.length > 0){

          // Se retornou algum resultado, é porque usuário já existe
          callback(400, {'Error': 'Usuário já existe (err001)'});

        }else {

          _data.selectByField('usuario', {'email': email}, function(err, results){
            if(!err && results){
              if(results.length > 0){
                // Se retornou algum resultado, é porque usuário já existe
                callback(400, {'Error': 'Usuário já existe (err001)'});

              }else {

                // Encriptar a senha
                senhaEncriptada = helpers.hash(senha);

                if(senhaEncriptada){

                  //criar o json do usuario
                  userData = {
                    'nome': nome,
                    'sobrenome': sobrenome,
                    'login': login,
                    'senha': senhaEncriptada,
                    'email': email,
                    'adm': adm
                  };
                  // Agora eu devo inserir o usuário no banco e retornar se consegui ou não
                  _data.insert('usuario', userData, function(result, err){
                    if(!err && result){
                      callback(200, {'id': result[0]});
                    }else {
                      callback(500, {'Error': 'Não foi possível inserir o usuário, tente novamente'});
                    }
                  });

                }else callback(500, {'Error': 'Não foi possível encriptar a senha do usuário'});

              }
            // Se houver erro a consulta não foi completada
            }else callback(500, {'Error': 'Não foi possível consultar o banco, tente novamente'});
          });

        }
      // Se houver erro a consulta não foi completada
      }else{
        callback(500, {'Error': 'Não foi possível consultar o banco, tente novamente'});
      }
    });
  } else {
    callback(400,{'Error' : 'Faltando campos obrigatórios'});
  }

};

// Usuarios - get
// Dados obrigatórios: login
// Dados opcionais: none
handlers._usuarios.get = function(data,callback){
  // Check that phone number is valid
  var login = typeof(data.queryStringObject.login) == 'string' && data.queryStringObject.login.trim().length > 0 ? data.queryStringObject.login.trim() : false;

  if(login){

    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verificar que o token é válido
    handlers._tokens.verificarToken(token,login,function(err){
      if(!err){

        // Procurar usuários
        _data.selectByField('usuario', {'login': login} , function(err,data){
          if(!err && data) {
            // Remover a senha do usuário do objeto retornado
            var userData = {
              'nome': data.nome,
              'sobrenome': data.sobrenome,
              'login': data.login,
              'email': data.email,
            };
            callback(200,data);
          } else {
            callback(404);
          }
        });

      } else {
        callback(err.code, { "Error" : err.Error });
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};



// Usuarios - put
// Dados obrigatórios : login
// Dados opcionais : nome, sobrenome, senha, email (Pelo menos um campo deve ser especificado)
handlers._usuarios.put = function(data,callback){
  // Conferir o campo obrigatório
  var login = typeof(data.payload.login) == 'string' && data.payload.login.trim().length > 0 ? data.payload.login.trim() : false;

  // Conferir os campos opcionais (* pelo menos um deve ser especificado)
  var nome = typeof(data.payload.nome) == 'string' && data.payload.nome.trim().length > 0 ? data.payload.nome.trim() : false;
  var sobrenome = typeof(data.payload.sobrenome) == 'string' && data.payload.sobrenome.trim().length > 0 ? data.payload.sobrenome.trim() : false;
  var senha = typeof(data.payload.senha) == 'string' && data.payload.senha.trim().length > 0 ? data.payload.senha.trim() : false;
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().indexOf('@') != -1 ? data.payload.email.trim() : false;


  // Checar se login é válido
  if(login){
    // Checar se algum campo opcional foi enviado
    if(nome || sobrenome || senha || email){

      // Verificar se o token foi enviado nos headers
      var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

      // Verificar que o token é valido e é do usuário correto
      handlers._tokens.verificarToken(token, login, function(err){
        if(!err){

          // Procurar o usuário que será alterado
          _data.selectByField('usuario', { 'login': login }, function(err, userData){
            if(!err && userData){

              if(userData.length == 1){

                // Atualiza os campos que são necessários
                if(nome){
                  userData[0].nome = nome;
                }
                if(sobrenome){
                  userData[0].sobrenome = sobrenome;
                }
                if(senha){
                  userData[0].senha = helpers.hash(senha);
                }
                if(email){
                  userData[0].email = email;
                }
                // Atualizar no banco
                _data.update('usuario', { 'login': login }, userData[0], function(err){
                  if(!err){
                    callback(200);
                  } else {
                    callback(500,{'Error' : 'Não foi possível atualizar o usuário, tente novamente'});
                  }
                });

              } else {
                callback(500, { 'Error' : 'Possível duplicidade de usuários, tente novamente' });
              }
            } else {
              callback(500, { 'Error' : 'Problemas ao encontrar o usuário, tente novamente' });
            }
          });
        } else {
          callback(err.code, { "Error" : err.Error });
        }
      });
    } else {
      callback(400,{ 'Error' : 'Pelo menos um campo opcional deve ser enviado de forma válida' });
    }
  } else {
    callback(400,{'Error' : 'Campo obrigatório não recebido'});
  }

};


// Dados obrigatórios: login
// Deletar usuários
handlers._usuarios.delete = function(data,callback){
  // Check that phone number is valid
  var login = typeof(data.queryStringObject.login) == 'string' && data.queryStringObject.login.trim().length > 0 ? data.queryStringObject.login.trim() : false;
  if(login){

    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Verify that the given token is valid for the login
    handlers._tokens.verificarToken(token, login, function(err){
      if(!err){
        // Lookup the user
        _data.selectByField('usuario', { 'login': login }, function(err, userData){
          if(!err && userData){

            if(userData.length == 1){

              // Delete the user's data
              _data.delete('usuario', { 'login': login}, function(err){
                if(!err){
                  callback(200);
                }else {
                  callback(500, {'Error': 'Não foi possível excluir o usuário, tente novamente'});
                }
              });

            }else {
              callback(500, { 'Error': 'Possível duplicidade de usuários, tente novamente e verifique o login fornecido' });
            }
          } else {
            callback(400,{'Error' : 'Usuário não encontrado'});
          }
        });
      } else {
        callback(err.code,{"Error" : err.Error});
      }
    });
  } else {
    callback(400, { 'Error' : 'Faltando campo obrigatório' });
  }
};

// tokens
handlers.tokens = function(data,callback) {
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._tokens[data.method](data,callback);
  } else {
    callback(405);
  }
};

handlers._tokens = {};

// Tokens - post
// Dados obrigatórios: login, senha
// Dados opcionais: none
handlers._tokens.post = function(data, callback){
  var login = typeof(data.payload.login) == 'string' && data.payload.login.trim().length > 0 ? data.payload.login.trim() : false;
  var senha = typeof(data.payload.senha) == 'string' && data.payload.senha.trim().length > 0 ? data.payload.senha.trim() : false;
  if(login && senha){
    // Procurar usuário com o login recebido
    _data.selectByField('usuario', {'login': login}, function(err,userData){
      if(!err && userData){
        if(userData.length == 1) {

          // Encriptar a senha recebida na request e comparar com o usuário que foi encontrado
          var senhaEncriptada = helpers.hash(senha);
          if(senhaEncriptada == userData[0].senha){
            // Se o usuário existe e a senha dele está correta, criar um novo token
            var tokenId = helpers.createRandomString(20);
            var validade = helpers.jsDateToMysqlDate(new Date(Date.now() + 1000 * 60 * 60));
            var tokenObject = {
              'id' : tokenId,
              'id_usuario' : userData[0].id,
              'validade' : validade
            };

            // Store the token
            _data.insert('token', tokenObject, function(result, err) {
              if(!err && result){
                callback(200, tokenObject);
              } else {
                callback(500, { 'Error' : 'Não foi possível criar o token, tente novamente' });
              }
            });
          }
          else {
            callback(400, { 'Error' : 'Senha incorreta (err001)'});
          }

        } else {
          callback(400, { 'Error' : 'Usuário não cadastrado (err002)' });
        }
      } else {
        callback(500, { 'Error': 'Problemas ao encontrar o usuário, tente novamente' });
      }
    });
  } else {
    callback(400, { 'Error' : 'Missing required field(s).' });
  }
};


// Tokens - get
// Dados obrigatórios: id
// Dados opcionais: none
handlers._tokens.get = function(data,callback){
  // Checar o id do token é válido
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

  if(id){
    // Procurar pelo token
    _data.selectByField('token', { 'id': id }, function(err, tokenData){
      if(!err && tokenData){
        if(tokenData.length == 1){
          callback(200, tokenData[0]);
        } else {
          callback(500, {'Error': 'Possível duplicidade de token, tente novamente'});
        }
      } else {
        callback(404);
      }
    });
  } else {
    callback(400,{'Error' : 'Token não fornecido ou inválido'});
  }
};


// Tokens - put
// Dados obrigatórios: id, extend
// Dados opcionais: none
handlers._tokens.put = function(data,callback){
  // Verificar que o dados obrigatórios foram enviados
  var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

  // Verificar se estão válidos o dados obrigatórios
  if(id && extend){
    // Procurar pelo token através do id fornecido
    _data.selectByField('token', {'id': id}, function(err,tokenData){
      if(!err && tokenData){

        if(tokenData.length == 1){
          // Check to make sure the token isn't already expired
          if( tokenData[0].validade >= helpers.jsDateToMysqlDate( new Date(Date.now()) ) ){
            // Set the expiration an hour from now
            tokenData[0].validade = helpers.jsDateToMysqlDate( new Date(Date.now() + 1000 * 3600));
            // Store the new updates
            _data.update('token', {'id': id}, tokenData[0],function(err){
              if(!err){
                callback(200);
              } else {
                callback(500,{'Error' : 'Não foi possível alterar o token'});
              }
            });
          } else {
            callback(400,{"Error" : "Token já expirado, não é possível extender sua validade"});
          }

        }else {
          callback(500, {'Error': 'Possível duplicidade de tokens, verifique o id enviado e tente novamente'});
        }
      } else {
        callback(400,{'Error' : 'O token não existe'});
      }
    });
  } else {
    callback(400,{"Error": "Faltando campos obrigatórios ou dados são inválidos"});
  }
};


// Tokens - delete
// Dados obrigatórios: id
// Dados opcionais: none
handlers._tokens.delete = function(data,callback){
  // Checar se o token recebido é válido
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

  // Checar se o resultado da validação
  if(id){
    // Procurar pelo token especificado
    _data.selectByField('token', {'id': id}, function(err, tokenData) {
      if( !err && tokenData ) {
        if(tokenData.length == 1){
          // Deletar o token
          _data.delete('token', {'id': id}, function( err ){
            if(!err){
              callback(200);
            } else {
              callback(500,{'Error' : 'Não foi possível deletar o token solicitado, tente novamente'});
            }
          });

        }else {
          callback(500,{'Error' : 'Não foi possível deletar o token solicitado, tente novamente'});
        }
      } else {
        callback(400,{'Error' : 'Could not find the specified token.'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};


// Categorias
handlers.categorias = function(data,callback) {
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._categorias[data.method](data,callback);
  } else {
    callback(405);
  }
};

handlers._categorias = {};

// Categorias - post
// Dados obrigatórios: nome, descricao
// Dados opcionais: none
handlers._categorias.post = function(data, callback){
  // Checar pelos campos obrigatórios
  var nome = typeof(data.payload.nome) == 'string' && data.payload.nome.length > 0 ? data.payload.nome : false;
  var descricao = typeof(data.payload.descricao) == 'string' && data.payload.descricao.length > 0 ? data.payload.descricao : false;

  if(nome && descricao){
    // Checar se há um token
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    _data.selectByField('token', {'id': token}, function(err, tokenData){
      if(!err && tokenData){
        if(tokenData.length == 1){
          if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {

            // Já que o token é válido, verificar se é de um usuário administrador
            _data.selectByField('usuario', {'id': tokenData[0].id_usuario}, function(err, userData) {
              if(!err && userData) {
                if(userData.length == 1) {
                  if(userData[0].adm) {
                    //Já que é tudo válido e é administrador, criar a categoria com o nome e descrição especificado
                    _data.insert('categoria', {'nome': nome, 'descricao': descricao}, function(result, err) {
                      if(!err && result){
                        callback(200, {'id': result[0]});
                      }else {
                        callback(500, {'Error': 'Não foi possível cadastrar a categoria, tente novamente'});
                      }
                    });

                  }else {
                    callback(400, {'Error': 'Usuário não autorizado a criar categorias'});
                  }
                }else {
                  callback(400, {'Error': 'Usuário dono do token não existe'});
                }
              }else {
                callback(500, {'Error': 'Não foi possível encontrar o usuário dono do token, tente novamente'});
              }
            });

          }else {
            callback(400, {'Error': 'Token expirado'});
          }
        }else {
          callback(400, {'Error': 'Token inexistente ou duplicado'});
        }
      }else {
        callback(500, {'Error': 'Não foi possível consultar o token, tente novamente'});
      }
    });

  }else {
    callback(400, {'Error': 'Faltando dados obrigatórios ou dados são inválidos'});
  }
}

// Categorias - get
// Dados obrigatórios: none
// Dados opcionais: id
handlers._categorias.get = function(data, callback) {
  // Conferir os dados opcionais
  var id = typeof(data.queryStringObject.id) == 'string' ? data.queryStringObject.id : false;

  // Verificar se o id foi enviado
  if(id) {
    _data.selectByField('categoria', {'id': id}, function(err, categoriaData) {
      if(!err && categoriaData) {
        if(categoriaData.length == 1) {
          callback(200, categoriaData[0]);
        } else {
          callback(400, {'Error': 'Categoria não cadastrada'});
        }
      }else {
        callback(500, { 'Error': 'Não foi possível encontrar a categoria especificada, tente novamente' });
      }
    });
  }else {

    _data.selectByField('categoria', {}, function(err, categoriaData) {
      if(!err && categoriaData) {
        callback(200, categoriaData);
      }else {
        callback(500, {'Error': 'Não foi possível consultar a lista de categorias, tente novamente'});
      }
    });

  }
};

// Categorias - put
// Dados obrigatórios: id
// Dados opcionais: nome, descricao (pelo menos um dado deve ser enviado)
handlers._categorias.put = function(data, callback) {
  // Verificar campos obrigatórios
  var id = typeof(data.payload.id) == 'number' ? data.payload.id : false;

  // Verificar campos opcionais
  var nome = typeof(data.payload.nome) == 'string' && data.payload.nome.trim().length > 0 ? data.payload.nome.trim() : false;
  var descricao = typeof(data.payload.descricao) == 'string' && data.payload.descricao.trim().length > 0 ? data.payload.descricao.trim() : false;

  //Verificar que o id foi enviado
  if(id) {
    // Verificar que algum dado opcional foi enviado
    if(nome || descricao) {

      var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
      _data.selectByField('token', {'id': token}, function(err, tokenData) {
        if(!err && tokenData) {
          if(tokenData.length == 1) {
            if( tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {
              // Verificar se o usuário dono do token é administrador
              _data.selectByField('usuario', {'id': tokenData[0].id_usuario}, function(err, userData) {
                if(!err && userData) {
                  if(userData.length == 1) {
                    if(userData[0].adm) {
                      // Já que tudo é válido e o usuário é administrador, alterar a categoria
                      _data.selectByField('categoria', {'id': id}, function(err, categoriaData) {
                        if(!err && categoriaData) {
                          if(categoriaData.length == 1) {
                            // Atualiza os campos necessários
                            if(nome){
                              categoriaData[0].nome = nome;
                            }
                            if(descricao){
                              categoriaData[0].descricao = descricao;
                            }

                            // Atualiza a categoria no banco
                            _data.update('categoria', {'id': id}, categoriaData[0], function(err) {
                              if(!err){
                                callback(200);
                              }else {
                                callback(500, {'Error': 'Não foi possível atualizar a categoria, tente novamente'});
                              }
                            });

                          }else {
                            callback(400, {'Error': 'Categoria inexistente'});
                          }
                        }else {
                          callback(500, {'Error': 'Problemas ao procurar a categoria especificada'});
                        }
                      });

                    }else {

                    }
                  }else {
                    callback(400, {'Error': 'Usuário dono do token não existe'});
                  }
                }else {
                  callback(500, {'Error': 'Não foi possível encontrar o usuário dono do token, tente novamente'});
                }
              });

            }else {
              callback(400, {'Error': 'Token expirado'});
            }
          }else {
            callback(400, {'Error': 'Token inexistente'});
          }
        }else {
          callback(500, {'Error': 'Problema ao procurar o token, tente novamente'});
        }
      });
    }else {
      callback(400, {'Error': 'Pelo menos um campo opcional deve ser enviado'});
    }
  }else {
    callback(400, {'Error': 'Id obrigatório não enviado'});
  }

}


// Categorias - delete
// Dados obrigatórios: id
// Dados opcionais: none
handlers._categorias.delete = function(data, callback) {
  // Verificar campos obrigatórios
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0 ? data.queryStringObject.id.trim() : false;

  //Verificar que o id foi enviado
  if(id) {
    var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
    _data.selectByField('token', {'id': token}, function(err, tokenData) {
      if(!err && tokenData) {
        if(tokenData.length == 1) {
          if( tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {

            // Verificar se o usuário é administrador
            _data.selectByField('usuario', {'id': tokenData[0].id_usuario}, function(err, userData) {
              if(!err && userData) {
                if(userData.length == 1) {
                  if(userData[0].adm) {
                    // Já que tudo é válido e o usuário é administrador
                    _data.selectByField('categoria', {'id': id}, function(err, categoriaData) {
                      if(!err && categoriaData) {
                        if(categoriaData.length == 1) {
                          // Deleta a categoria no banco
                          _data.delete('categoria', {'id': id}, function(err) {
                            if(!err){
                              // Confere se tem imagem e exclui ela junto
                              glob(__dirname + '/../../storage/categorias/imagem/' + id + '.*', {}, function(err, files) {
                                if(!err && files) {
                                  if(files.length == 1) {
                                    var caminhoImagem = files[0];
                                    fs.unlink(caminhoImagem, (err) => {
                                      if (!err) {
                                        callback(200);
                                      }else {
                                        console.log('Não foi possível deletar a imagem do cartão');
                                      }
                                    });
                                  }else {
                                    callback(400, {'Error': 'A imagem deste cartão não existe, solicite ao administrador o upload da mesma'});
                                  }
                                }else {
                                  callback(500, {'Error': 'Não foi possível encontrar o arquivo especificado, tente novamente ou verifique sua requisição'})
                                }
                              });
                            }else {
                              callback(500, {'Error': 'Não foi possível deletar a categoria, tente novamente'});
                            }
                          });

                        }else {
                          callback(400, {'Error': 'Categoria inexistente'});
                        }
                      }else {
                        callback(500, {'Error': 'Problemas ao procurar a categoria especificada'});
                      }
                    });

                  }else {
                    callback(400, {'Error': 'Usuário não autorizado deletar categoria'});
                  }
                }else {
                  callback(400, {'Error': 'Usuário dono do token não existe'});
                }
              }else {
                callback(500, {'Error': 'Não foi possível encontrar o usuário dono do token, tente novamente'});
              }
            });

          }else {
            callback(400, {'Error': 'Token expirado'});
          }
        }else {
          callback(400, {'Error': 'Token inexistente'});
        }
      }else {
        callback(500, {'Error': 'Problema ao procurar o token, tente novamente'});
      }
    });
  }else {
    callback(400, {'Error': 'Id obrigatório não enviado'});
  }

}

// Cartões
handlers.cartoes = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._cartoes[data.method](data,callback);
  } else {
    callback(405);
  }
};


handlers._cartoes = {};

// Cartões - post
// Dados obrigatórios: id_categoria, nome
// Dados opcionais: none
handlers._cartoes.post = function(data, callback) {

  var id_categoria = typeof(data.payload.id_categoria) == 'number' ? data.payload.id_categoria : false;
  var nome = typeof(data.payload.nome) == 'string' && data.payload.nome.length > 0 ? data.payload.nome : false;

  // Conferir se os dados obrigatórios foram enviados
  if(id_categoria && nome) {

    // Verificar se o token foi enviado
    var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

    if(token){

      _data.selectByField('token', {'id': token}, function(err, tokenData) {
        if(!err && tokenData) {
          if(tokenData.length == 1) {
            if( tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {
              // Verificar se o dono do token é administrador
              _data.selectByField('usuario', {'id': tokenData[0].id_usuario}, function(err, userData) {
                if(!err && userData) {
                  if(userData.length == 1) {
                    if(userData[0].adm) {
                      // Já que é tudo válido e o usuário é administrador
                      var cartaoData = {
                        'id_categoria': id_categoria,
                        'nome': nome
                      };

                      _data.insert('cartao', cartaoData, function(result, err) {
                        if(!err && result) {
                          callback(200, {'id': result[0]});
                        }else {
                          callback(500, {'Error': 'Não foi possível cadastrar o cartão, tente novamente'});
                        }
                      });

                    }else {
                      callback(400, {'Error': 'Usuário não autorizado a criar cartões'});
                    }
                  }else {
                    callback(400, {'Error': 'Usuário dono do token não existe'});
                  }
                }else {
                  callback(500, {'Error': 'Não foi possível encontrar o usuário dono do token, tente novamente'});
                }
              });


            }else {
              callback(401, {'Error': 'Token expirado'});
            }
          }else {
            callback(400, {'Error': 'Token inexistente'});
          }
        }else {
          callback(500, {'Error': 'Problemas ao procurar o token, tente novamente'});
        }
      });

    }else {
      callback(400, {'Error': 'Token não foi enviado'});
    }

  }else {
    callback(400, {'Error': 'Dados obrigatórios não foram enviados'});
  }
}

// Cartoes - get
// Dados obrigatórios: none
// Dados opcionais: id, id_categoria, id_cartao
handlers._cartoes.get = function(data, callback) {

  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0 ? data.queryStringObject.id.trim() : false;
  var id_categoria = typeof(data.queryStringObject.id_categoria) == 'string' && data.queryStringObject.id_categoria.trim().length > 0 ? data.queryStringObject.id_categoria.trim() : false;
  var id_painel = typeof(data.queryStringObject.id_painel) == 'string' && data.queryStringObject.id_painel.trim().length > 0 ? data.queryStringObject.id_painel.trim() : false;

  if(id) {

    var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;

    if(token) {

      _data.selectByField('token', {'id': token}, function(err, tokenData) {
        if(!err && tokenData) {
          if(tokenData.length == 1) {

            if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {

              _data.selectByField('cartao', {'id': id}, function(err, cartaoData) {
                if(!err && cartaoData) {

                  if(cartaoData.length == 1) {
                    callback(200, cartaoData[0]);
                  }else {
                    callback(400, {'Error': 'Cartão inexistente'});
                  }

                }else {
                  callback(500, {'Error': 'Problemas ao procurar pelo cartão, tente novamente'});
                }
              });

            }else {
              callback(400, {'Error': 'Token expirado'});
            }

          }else {
            callback(400, {'Error': 'Token inexistente'});
          }
        }else {
          callback(500, {'Error': 'Problemas ao procurar o token, tente novamente'});
        }
      });

    }else {
      callback(400, {'Error': 'Token não enviado'});
    }


  } else if(id_categoria) {

    var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;

    if(token) {

      _data.selectByField('token', {'id': token}, function(err, tokenData) {
        if(!err && tokenData) {
          if(tokenData.length == 1) {

            if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {

              //retornar todos os cartões da categoria especificada
              _data.selectByField('cartao', {'id_categoria': id_categoria}, function(err, cartaoData) {
                if(!err && cartaoData) {

                    callback(200, cartaoData);

                }else {
                  callback(500, {'Error': 'Problemas ao procurar pelo cartão, tente novamente'});
                }
              });

            }else {
              callback(400, {'Error': 'Token expirado'});
            }

          }else {
            callback(400, {'Error': 'Token inexistente'});
          }
        }else {
          callback(500, {'Error': 'Problemas ao procurar o token, tente novamente'});
        }
      });

    }else {
      callback(400, {'Error': 'Token não enviado'});
    }

  } else if(id_painel) {

    var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;

    if(token) {

      _data.selectByField('token', {'id': token}, function(err, tokenData) {
        if(!err && tokenData) {
          if(tokenData.length == 1) {

            if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {

              // Verificar se o dono do token é dono do painel
              _data.selectByField('painel', {'id': id_painel}, function(err, painelData) {

              });

              //retornar todos os cartões da categoria especificada
              _data.selectByField('rel_painel_cartao', {'id_painel': id_painel}, function(err, cartaoData) {
                if(!err && cartaoData) {
                    callback(200, cartaoData);
                }else {
                  callback(500, {'Error': 'Problemas ao procurar pelo cartão, tente novamente'});
                }
              });

            }else {
              callback(400, {'Error': 'Token expirado'});
            }

          }else {
            callback(400, {'Error': 'Token inexistente'});
          }
        }else {
          callback(500, {'Error': 'Problemas ao procurar o token, tente novamente'});
        }
      });

    }else {
      callback(400, {'Error': 'Token não enviado'});
    }

  }else {

    var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;

    if(token) {

      _data.selectByField('token', {'id': token}, function(err, tokenData) {
        if(!err && tokenData) {
          if(tokenData.length == 1) {

            if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {

              _data.selectByField('cartao', {}, function(err, cartaoData) {
                if(!err && cartaoData) {

                    callback(200, cartaoData);

                }else {
                  callback(500, {'Error': 'Problemas ao procurar pelo cartão, tente novamente'});
                }
              });

            }else {
              callback(400, {'Error': 'Token expirado'});
            }

          }else {
            callback(400, {'Error': 'Token inexistente'});
          }
        }else {
          callback(500, {'Error': 'Problemas ao procurar o token, tente novamente'});
        }
      });

    }else {
      callback(400, {'Error': 'Token não enviado'});
    }


  }
};

// Cartoes - put
// Dados obrigatórios: id
// Dados opcionais: id_categoria, nome (pelo menos um dos dois deve ser especificado)
handlers._cartoes.put = function(data, callback) {
  // Receber dados obirgatórios
  var id = typeof(data.payload.id) == 'number' ? data.payload.id : false;

  // Receber dados opcionais
  var id_categoria = typeof(data.payload.id_categoria) == 'number' ? data.payload.id_categoria : false;
  var nome = typeof(data.payload.nome) == 'string' && data.payload.nome.trim().length > 0 ? data.payload.nome.trim() : false;

  // Verificar o id
  if(id) {
    // Verificar id_categoria e nome
    if(id_categoria || nome) {

      var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;

      if(token) {

        _data.selectByField('token', {'id': token}, function(err, tokenData) {

          if(!err && tokenData) {

            if(tokenData.length == 1){

              if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {

                // Verificar se o dono do token é administrador
                _data.selectByField('usuario', {'id': tokenData[0].id_usuario}, function(err, userData) {
                  if(!err && userData) {
                    if(userData.length == 1) {
                      if(userData[0].adm) {
                        // Já que é tudo válido e o usuário é administrador
                        _data.selectByField('cartao', {'id': id}, function(err, cartaoData) {

                          if(!err && cartaoData) {
                            if(cartaoData.length == 1) {
                              if(id_categoria) {
                                cartaoData[0].id_categoria = id_categoria;
                              }
                              if(nome) {
                                cartaoData[0].nome = nome;
                              }

                              _data.update('cartao', {'id': id}, cartaoData[0], function(err) {
                                if(!err) {

                                  callback(200);

                                }else {
                                  callback(500, {'Error': 'Não foi possível atualizar o cartao, tente novamente'});
                                }
                              });
                            } else {
                              callback(400, {'Error': 'Cartão inexistente'});
                            }
                          }else {
                            callback(500, {'Error': 'Problemas ao procurar o cartao, tente novamente'});
                          }

                        });

                      }else {
                        callback(400, {'Error': 'Usuário não autorizado a criar cartões'});
                      }
                    }else {
                      callback(400, {'Error': 'Usuário dono do token não existe'});
                    }
                  }else {
                    callback(500, {'Error': 'Não foi possível encontrar o usuário dono do token, tente novamente'});
                  }
                });

              }else {
                callback(400, {'Error': 'Token expirado'});
              }

            }else {
              callback(400, {'Error': 'Token inexistente'});
            }

          }else {
            callback(500, {'Error': 'Problemas ao procurar o token, tente novamente'});
          }

        });

      }else {
        callback(400, {'Error': 'Token não enviado'});
      }

    }else {
      callback(400, {'Error': 'Pelo menos um dado opcional deve ser enviado, nenhum encontrado'});
    }

  }else {
    callback(400, {'Error': 'Faltando dado obirgatório (id)'});
  }
};

// Cartao - delete
// Dados obrigatórios: id
// Dados opcionais: none
handlers._cartoes.delete = function(data, callback) {
  // Verificar dados obrigatórios
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0 ? data.queryStringObject.id.trim() : false;

  if(id) {

    var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

    if(token) {

      _data.selectByField('token', {'id': token}, function(err, tokenData) {
        if(!err && tokenData) {

          if(tokenData.length == 1) {

            if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now()))) {

              // Verificar se o dono do token é administrador
              _data.selectByField('usuario', {'id': tokenData[0].id_usuario}, function(err, userData) {
                if(!err && userData) {
                  if(userData.length == 1) {
                    if(userData[0].adm) {
                      // Já que é tudo válido e o usuário é administrador
                      _data.delete('cartao', {'id': id}, function(err) {

                        if(!err) {
                          // Confere se tem imagem e exclui ela junto
                          glob(__dirname + '/../../storage/cartoes/imagem/' + id + '.*', {}, function(err, files) {
                            if(!err && files) {
                              if(files.length == 1) {
                                var caminhoImagem = files[0];
                                fs.unlink(caminhoImagem, (err) => {
                                  if (!err) {
                                    callback(200);
                                  }else {
                                    console.log('Não foi possível deletar a imagem do cartão');
                                  }
                                });
                              }else {
                                callback(400, {'Error': 'A imagem deste cartão não existe, solicite ao administrador o upload da mesma'});
                              }
                            }else {
                              callback(500, {'Error': 'Não foi possível encontrar o arquivo especificado, tente novamente ou verifique sua requisição'})
                            }
                          });
                        }else {
                          callback(500, {'Error': 'Não foi possível deletar o cartão, tente novamente'});
                        }

                      });

                    }else {
                      callback(400, {'Error': 'Usuário não autorizado a criar cartões'});
                    }
                  }else {
                    callback(400, {'Error': 'Usuário dono do token não existe'});
                  }
                }else {
                  callback(500, {'Error': 'Não foi possível encontrar o usuário dono do token, tente novamente'});
                }
              });

            }else {
              callback(400, {'Error': 'Token expirado'});
            }

          }else {
            callback(400, {'Error': 'Token inexistente'});
          }

        }else {
          callback(500, {'Error': 'Problemas ao procurar o token, tente novamente'});
        }
      });

    }else {
      callback(400, {'Error': 'Token não enviado'});
    }

  }else {
    callback(400, {'Error': 'Faltando dado obrigatório (id)'});
  }
}

// Painéis
handlers.paineis = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._paineis[data.method](data,callback);
  } else {
    callback(405);
  }
};


handlers._paineis = {};

// Paineis - post
// Dados obrigatórios: id_usuario, nome, descricao
// Dados opcionais: addcartao => (id_cartao, id_painel)
handlers._paineis.post = function(data, callback) {
  // Conferir dados obrigatórios
  var id_usuario = typeof(data.payload.id_usuario) == 'number' ? data.payload.id_usuario : false;
  var nome = typeof(data.payload.nome) == 'string' && data.payload.nome.length > 0 ? data.payload.nome : false;
  var descricao = typeof(data.payload.descricao) == 'string' && data.payload.descricao.length > 0 ? data.payload.descricao : false;

  // Conferir dados opcionais
  var addcartao = typeof(data.queryStringObject.addcartao) === 'string' && data.queryStringObject.addcartao.trim().length > 0 && data.queryStringObject.addcartao.trim() === 'true' ? true : false;
  var id_cartao = typeof(data.payload.id_cartao) === 'number' ? data.payload.id_cartao : false;
  var id_painel = typeof(data.payload.id_painel) === 'number' ? data.payload.id_painel : false;


  if(addcartao) {
    // Verificar dados obrigatórios
    if(id_cartao && id_painel) {

      // Verificar token
      var token = typeof(data.headers.token) === 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

      if(token) {
        _data.selectByField('token', {'id': token}, function(err, tokenData) {
          if(!err && tokenData) {
            if(tokenData.length == 1) {
              if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now()))) {
                // Confere se o dono do token é dono do painel
                _data.selectByField('painel', {'id': id_painel}, function(err, painelData) {
                  if(!err && painelData) {
                    if(painelData.length == 1) {
                      if(painelData[0].id_usuario === tokenData[0].id_usuario) {
                        // Já que o painel existe e é do mesmo usuário dono do token, confere se o cartão especificado existe
                        _data.selectByField('cartao', {'id': id_cartao}, function(err, cartaoData) {
                          if(!err && cartaoData) {
                            if(cartaoData.length == 1) {
                              //Já que o cartão e o painel existem, e o usuário é autorizado, então insere o cartão no painel
                              _data.insert('rel_painel_cartao', {'id_cartao': id_cartao, 'id_painel': id_painel}, function(result, err) {
                                if(!err && result) {
                                  callback(200, {'id': result[0]});
                                }else {
                                  callback(500, {'Error': 'Não foi possível adicionar o cartão, o mesmo pode já ter sido inserido'});
                                }
                              });
                            }else {
                              callback(400, {'Error': 'Cartão inexistente'});
                            }
                          }else {
                            callback(500, {'Error': 'Não foi possível procurar o cartão especificado'});
                          }
                        });
                      } else {
                        callback(400, {'Error': 'Dono do painel não é o dono do token, portanto, não autorizado'});
                      }
                    }else {
                      callback(400, {'Error': 'Painel inexistente'});
                    }
                  }else {
                    callback(500, {'Error': 'Não foi possível procurar o painel especificado, tente novamente'});
                  }
                });
              }else {
                callback(400, {'Error': 'Token expirado'});
              }
            }else {
              callback(400, {'Error': 'Token inexistente'});
            }
          }else {
            callback(500, {'Error': 'Não foi possível procurar pelo token'});
          }
        });
      }else {
        callback(400, {'Error': 'Token não enviado'});
      }

    }else {
      callback(400, {'Error': 'Para adicionar um cartão é necessário enviar o id_cartao e id_painel, nenhum encontrado'});
    }
  }else {

    // Verificar dados obrigatórios
    if(id_usuario && nome && descricao) {

      var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
      // Conferir token
      if(token) {

        _data.selectByField('token', {'id': token}, function(err, tokenData) {

          if(!err && tokenData) {
            if(tokenData.length == 1) {
              if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now()))) {

                // Conferir se o dono do token está criando o painel dele
                if(id_usuario === tokenData[0].id_usuario) {

                  // Criar o json para dar insert o painel no banco
                  const painelData = {
                    'id_usuario': id_usuario,
                    'nome': nome,
                    'descricao': descricao
                  };

                  // Insert no banco
                  _data.insert('painel', painelData, function(result, err) {
                    if(!err && result) {
                      callback(200, {'id': result[0]});
                    }else {
                      callback(500, {'Error': 'Não foi possível inserir o painel no banco, tente novamente'});
                    }
                  });

                }else {
                  callback(400, {'Error': 'O dono do token não é dono do painel a ser criado'});
                }

              }else {
                callback(400, {'Error': 'Token expirado'});
              }
            }else {
              callback(400, {'Error': 'Token inexistente'});
            }
          }else {
            callback(500, {'Error': 'Não foi possível procurar o token, tente novamente'});
          }

        });

      }else {
        callback(400, {'Error': 'Token não enviado'});
      }
    }else {
      callback(400, {'Error': 'Faltando dado(s) obrigatório(s) (id_usuario, nome, descricao)'});
    }

  }
}

// Paineis - get
// Dados obrigatórios: id_usuario
// Dados opcionais: id
handlers._paineis.get = function(data, callback) {
  // Conferir dados obrigatórios
  var id_usuario = typeof(data.queryStringObject.id_usuario) === 'string' && data.queryStringObject.id_usuario.trim().length > 0 ? data.queryStringObject.id_usuario : false;

  // Conferir dados opcionais
  var id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length > 0 ? data.queryStringObject.id.trim() : false;

  if(id_usuario) {
    // Se tem id, pega o painel do usuário com o id dado
    if(id) {
      var token = typeof(data.headers.token) === 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

      if(token) {
        _data.selectByField('token', {'id': token}, function(err, tokenData) {
          if(!err && tokenData) {
            if(tokenData.length == 1) {
              if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now()))) {
                if(tokenData[0].id_usuario == id_usuario) {
                  // Já que é autorizado, pegar o painel expecificado
                  _data.selectByField('painel', {'id': id, 'id_usuario': id_usuario}, function(err, painelData) {
                    if(!err && painelData) {
                      if(painelData.length == 1) {
                        callback(200, painelData[0]);
                      }else {
                        callback(400, {'Error': 'Painel inexistente'});
                      }
                    }else {
                      callback(500, {'Error': 'Não foi possível procurar o painel, tente novamente'});
                    }
                  });
                }else {
                  callback(400, {'Error': 'O dono do token não é dono do painel'});
                }
              }else {
                callback(400, {'Error': 'Token expirado'});
              }
            }else {
              callback(400, {'Error': 'Token inexistente'});
            }
          }else {
            callback(500, {'Error': 'Não foi possível procurar o token, tente novamente'});
          }
        });
      }else {
        callback(400, {'Error': 'Token não enviado'});
      }

    }else {
      // Já que não tem id, pega todos paineis do usuário
      var token = typeof(data.headers.token) === 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

      if(token) {
        _data.selectByField('token', {'id': token}, function(err, tokenData) {
          if(!err && tokenData) {
            if(tokenData.length == 1) {
              if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now()))) {
                if(tokenData[0].id_usuario == id_usuario) {
                  // Já que é autorizado, pegar o painel expecificado
                  _data.selectByField('painel', {'id_usuario': id_usuario}, function(err, painelData) {
                    if(!err && painelData) {

                      callback(200, painelData);

                    }else {
                      callback(500, {'Error': 'Não foi possível procurar os painéis, tente novamente'});
                    }
                  });
                }else {
                  callback(400, {'Error': 'O dono do token não é dono do painel'});
                }
              }else {
                callback(400, {'Error': 'Token expirado'});
              }
            }else {
              callback(400, {'Error': 'Token inexistente'});
            }
          }else {
            callback(500, {'Error': 'Não foi possível procurar o token, tente novamente'});
          }
        });
      }else {
        callback(400, {'Error': 'Token não enviado'});
      }
    }
  }else {
    callback(400, {'Error': 'Faltando dado obrigatório (id_usuario)'});
  }
}

// Paineis - put
// Dados obrigatórios: id
// Dados opcionais: nome, descricao (pelo menos um deve ser enviado)
handlers._paineis.put = function(data, callback) {
  // Conferir dados obrigatórios
  var id = typeof(data.payload.id) === 'number' ? data.payload.id : false;

  // Conferir dados opcionais
  var nome = typeof(data.payload.nome) === 'string' && data.payload.nome.length > 0 ? data.payload.nome : false;
  var descricao = typeof(data.payload.descricao) === 'string' && data.payload.descricao.length > 0 ? data.payload.descricao : false;

  //Verificar dados obrigatórios
  if(id) {
    // Verificar dados opcionais
    if(nome || descricao) {
      // Verificar token
      var token = typeof(data.headers.token) === 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
      if(token) {
        _data.selectByField('token', {'id': token}, function(err, tokenData) {
          if(!err && tokenData) {
            if(tokenData.length == 1) {
              if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now()))) {
                // Procurar por painel
                _data.selectByField('painel', {'id': id}, function(err, painelData) {
                  if(!err && painelData) {
                    if(painelData.length == 1) {
                      if(nome) {
                        painelData[0].nome = nome;
                      }
                      if(descricao) {
                        painelData[0].descricao = descricao;
                      }

                      _data.update('painel', {'id': id}, painelData[0], function(err) {
                        if(!err) {
                          callback(200);
                        }else {
                          console.log(err);
                          callback(500, {'Error': 'Não foi possível alterar o painel, tente novamente'});
                        }
                      });
                    }else {
                      callback(400, {'Error': 'Painel especificado não existe'});
                    }
                  }else {
                    callback(500, {'Error': 'Não foi possível procurar o painel especificado, tente novamente'});
                  }
                });
              }else {
                callback(400, {'Error': 'Token expirado'});
              }
            }else {
              callback(400, {'Error': 'Token inexistente'});
            }
          }else {
            callback(500, {'Error': 'Não foi possível procurar o token, tente novamente'});
          }
        });
      }else {
        callback(400, {'Error': 'Token não enviado'});
      }

    }else {
      callback(400, {'Error': 'Pelo menos um dos dados opcionais deve ser enviado (nome, descricao), nenhum encontrado'});
    }
  }else {
    callback(400, {'Error': 'Faltando dados obrigatórios (id)'});
  }

}

// Paineis - delete
// Dados obrigatórios: id_usuario
// Dados opcionais: id, id_cartao
handlers._paineis.delete = function(data, callback) {
  // Verificar dados obrigatórios
  var id_usuario = typeof(data.queryStringObject.id_usuario) == 'string' && data.queryStringObject.id_usuario.trim().length > 0 ? data.queryStringObject.id_usuario.trim() : false;

  // Verificar dados opcionais
  var id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length > 0 ? data.queryStringObject.id.trim() : false;
  var id_cartao = typeof(data.queryStringObject.id_cartao) == 'string' && data.queryStringObject.id_cartao.trim().length > 0 ? data.queryStringObject.id_cartao.trim() : false;

  // Conferir dados obrigatórios
  if(id_usuario) {
    // Conferir dados opcionais
    if(!id_cartao && id) {
      //Conferir o token
      var token = typeof(data.headers.token) === 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

      if(token) {
        _data.selectByField('token', {'id': token}, function(err, tokenData) {
          if(!err && tokenData) {
            if(tokenData.length == 1) {
              if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now()))) {
                if(tokenData[0].id_usuario == id_usuario) {
                  //deletar painel especificado
                  _data.delete('painel', {'id': id}, function(err) {
                    if(!err) {
                      callback(200);
                    }else {
                      callback(500, {'Error': 'Não foi possível deletar o painel especificado, tente novamente'});
                    }
                  });
                }else {
                  callback(400, {'Error': 'Usuário dono do token não é dono do painel, portanto não está autorizado a deletá-lo'});
                }
              }else {
                callback(400, {'Error': 'Token expirado'});
              }
            }else {
              callback(400, {'Error': 'Token inexistente'});
            }
          }else {
            callback(400, {'Error': 'Não foi possível procurar pelo token'});
          }
        });
      }else {
        callback(400, {'Error': 'Token não enviado'});
      }

    }else if(id_cartao && id) {
      //Conferir o token
      var token = typeof(data.headers.token) === 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
      if(token) {
        _data.selectByField('token', {'id': token}, function(err, tokenData) {
          if(!err && tokenData) {
            if(tokenData.length == 1) {
              if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now()))) {
                if(tokenData[0].id_usuario == id_usuario) {
                  //deletar painel especificado
                  _data.delete('rel_painel_cartao', {'id_painel': id, 'id_cartao': id_cartao}, function(err) {
                    if(!err) {
                      callback(200);
                    }else {
                      callback(500, {'Error': 'Não foi possível deletar o painel especificado, tente novamente'});
                    }
                  });
                }else {
                  callback(400, {'Error': 'Usuário dono do token não é dono do painel, portanto não está autorizado a deletá-lo'});
                }
              }else {
                callback(400, {'Error': 'Token expirado'});
              }
            }else {
              callback(400, {'Error': 'Token inexistente'});
            }
          }else {
            callback(400, {'Error': 'Não foi possível procurar pelo token'});
          }
        });
      }else {
        callback(400, {'Error': 'Token não enviado'});
      }

    }else {
      //Conferir o token
      var token = typeof(data.headers.token) === 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

      if(token) {
        _data.selectByField('token', {'id': token}, function(err, tokenData) {
          if(!err && tokenData) {
            if(tokenData.length == 1) {
              if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now()))) {
                if(tokenData[0].id_usuario == id_usuario) {
                  // deletar todos paineis do usuário especificado
                  _data.delete('painel', {'id_usuario': id_usuario}, function(err) {
                    if(!err) {
                      callback(200);
                    }else {
                      callback(500, {'Error': 'Não foi possível deletar o painel especificado, tente novamente'});
                    }
                  });
                }else {
                  callback(400, {'Error': 'Usuário dono do token não é dono do painel, portanto não está autorizado a deletá-lo'});
                }
              }else {
                callback(400, {'Error': 'Token expirado'});
              }
            }else {
              callback(400, {'Error': 'Token inexistente'});
            }
          }else {
            callback(400, {'Error': 'Não foi possível procurar pelo token'});
          }
        });
      }else {
        callback(400, {'Error': 'Token não enviado'});
      }

    }
  }else {
    callback(400, {'Error': 'Faltando dados obrigatórios (id_usuario)'});
  }
}

// Container de todas os handlers de arquivos
handlers.arquivos = {};

// Confere o método e redirecionar para a rota correta de upload
handlers.arquivos.cartoes = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers.arquivos._cartoes[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container das rotas de arquivos de cartões
handlers.arquivos._cartoes = {};

// arquivos Cartões - post
// Dados obrigatórios: id, imagem
// Dados opcionais: none
handlers.arquivos._cartoes.post = function(data, callback) {

  // Conferir dados obrigatórios
  if(data.payload.fields.id){
    var id = typeof(data.payload.fields.id[0]) == 'string' && data.payload.fields.id[0].trim().length > 0 ? data.payload.fields.id[0].trim() : false;
  }
  if(data.payload.files.imagem){
    var imagem = typeof(data.payload.files.imagem[0]) == 'object' ? data.payload.files.imagem[0] : false;
  }

  // Conferir dados obrigatórios
  if(id) {

    if(imagem) {

      var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

      if(token) {

        _data.selectByField('token', {'id': token}, function(err, tokenData) {
          if(!err && tokenData) {
            if(tokenData.length == 1) {
              if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {

                // Verificar se o dono do token é administrador
                _data.selectByField('usuario', {'id': tokenData[0].id_usuario}, function(err, userData) {
                  if(!err && userData) {
                    if(userData.length == 1) {
                      if(userData[0].adm) {
                        // Já que é tudo válido e o usuário é administrador
                        if(imagem) {
                          //Pegar a extensão do arquivo
                          var index = imagem.originalFilename.split('.').length - 1;
                          var extensao = imagem.originalFilename.split('.')[index];
                          var nomeArquivo = id + '.' + extensao;
                          var novoCaminho = __dirname + '/../../storage/cartoes/imagem/';
                          fs.access(novoCaminho + nomeArquivo, fs.F_OK, (err) =>{

                            if(!err){
                              callback(400, {'Error': 'Essa rota é para inserir uma imagem e não atualizá-la, para substituir a imagem atual utilize um PUT'});
                            }else {
                              _data.moverArquivo(nomeArquivo, imagem, novoCaminho, function(err) {

                                if(!err) {
                                  callback(200);
                                }else {
                                  callback(500, {'Error': 'Não foi possível fazer o upload da imagem, tente novamente'});
                                }

                              });

                            }
                          });
                        }

                      }else {
                        callback(400, {'Error': 'Usuário não autorizado a criar cartões'});
                      }
                    }else {
                      callback(400, {'Error': 'Usuário dono do token não existe'});
                    }
                  }else {
                    callback(500, {'Error': 'Não foi possível encontrar o usuário dono do token, tente novamente'});
                  }
                });

              }else {
                callback(400, {'Error': 'Token expirado'});
              }
            }else {
              callback(400, {'Error': 'Token inexistente'});
            }
          }else {
            callback(500, {'Error': 'Não foi possível procurar o token, tente novamente'});
          }
        });

      }else {
        callback(400, {'Error': 'Token não enviado'});
      }

    }else {
      callback(400, {'Error': 'Dado obrigatório não enviado (imagem)'});
    }

  }else {
    callback(400, {'Error': 'Dado obrigatório não enviado (id)'});
  }

};



// Arquivos Cartões - get
// Dados obrigatórios: id
// Dados opcionais: none
handlers.arquivos._cartoes.get = function(data, callback) {

  // Conferir dados obrigatórios
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0 ? data.queryStringObject.id : false;

  if(id) {

    var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false;

    if(token) {

      _data.selectByField('token', {'id': token}, function(err, tokenData) {
        if(!err && tokenData) {
          if(tokenData.length == 1) {
            if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now()))) {
              // Prepara imagem para envio
              glob(__dirname + '/../../storage/cartoes/imagem/' + id + '.*', {}, function(err, files) {
                if(!err && files) {
                  if(files.length == 1) {
                    var caminhoImagem = files[0];
                    callback(200, caminhoImagem);

                  }else {
                    callback(400, {'Error': 'A imagem deste cartão não existe, solicite ao administrador o upload da mesma'});
                  }
                }else {
                  callback(500, {'Error': 'Não foi possível encontrar o arquivo especificado, tente novamente ou verifique sua requisição'})
                }
              });
            }else {
              callback(400, {'Error': 'Token expirado'});
            }
          }else {
            callback(400, {'Error': 'Token não existe'});
          }
        }else {
          callback(500, {'Error': 'Não foi possível encontrar o token, tente novamente'});
        }
      });

    }else {
      callback(400, {'Error': 'Token não enviado'});
    }

  }else {
    callback(400, {'Error': 'Faltando dados obrigatórios(id)'});
  }
};



// arquivos Cartões - put
// Dados obrigatórios: id, imagem
// Dados opcionais: none
handlers.arquivos._cartoes.put = function(data, callback) {

  // Conferir dados obrigatórios
  if(data.payload.fields.id){
    var id = typeof(data.payload.fields.id[0]) == 'string' && data.payload.fields.id[0].trim().length > 0 ? data.payload.fields.id[0].trim() : false;
  }
  if(data.payload.files.imagem){
    var imagem = typeof(data.payload.files.imagem[0]) == 'object' ? data.payload.files.imagem[0] : false;
  }
  // Conferir dados obrigatórios
  if(id) {

    if(imagem) {

      var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

      if(token) {

        _data.selectByField('token', {'id': token}, function(err, tokenData) {
          if(!err && tokenData) {
            if(tokenData.length == 1) {
              if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {


                // Verificar se o dono do token é administrador
                _data.selectByField('usuario', {'id': tokenData[0].id_usuario}, function(err, userData) {
                  if(!err && userData) {
                    if(userData.length == 1) {
                      if(userData[0].adm) {
                        // Já que é tudo válido e o usuário é administrador
                        if(imagem) {
                          //Pegar a extensão do arquivo
                          var index = imagem.originalFilename.split('.').length - 1;
                          var extensao = imagem.originalFilename.split('.')[index];
                          var nomeArquivo = id + '.' + extensao;
                          var novoCaminho = __dirname + '/../../storage/cartoes/imagem/';
                          _data.moverArquivo(nomeArquivo, imagem, novoCaminho, function(err) {

                            if(!err) {
                              callback(200);
                              }else {
                                callback(500, {'Error': 'Não foi possível fazer o upload da imagem, tente novamente'});
                              }

                          });
                        }

                      }else {
                        callback(400, {'Error': 'Usuário não autorizado a criar cartões'});
                      }
                    }else {
                      callback(400, {'Error': 'Usuário dono do token não existe'});
                    }
                  }else {
                    callback(500, {'Error': 'Não foi possível encontrar o usuário dono do token, tente novamente'});
                  }
                });



              }else {
                callback(400, {'Error': 'Token expirado'});
              }
            }else {
              callback(400, {'Error': 'Token inexistente'});
            }
          }else {
            callback(500, {'Error': 'Não foi possível procurar o token, tente novamente'});
          }
        });

      }else {
        callback(400, {'Error': 'Token não enviado'});
      }

    }else {
      callback(400, {'Error': 'Dado obrigatório não enviado (imagem)'});
    }

  }else {
    callback(400, {'Error': 'Dado obrigatório não enviado (id)'});
  }

};



handlers.arquivos.categorias = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers.arquivos._categorias[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container das rotas de arquivos de categoria
handlers.arquivos._categorias = {};

// arquivos Categoria - post
// Dados obrigatórios: id, imagem
// Dados opcionais: none
handlers.arquivos._categorias.post = function(data, callback) {

  // Conferir dados obrigatórios
  if(data.payload.fields.id){
    var id = typeof(data.payload.fields.id[0]) == 'string' && data.payload.fields.id[0].trim().length > 0 ? data.payload.fields.id[0].trim() : false;
  }
  if(data.payload.files.imagem){
    var imagem = typeof(data.payload.files.imagem[0]) == 'object' ? data.payload.files.imagem[0] : false;
  }

  // Conferir dados obrigatórios
  if(id) {

    if(imagem) {

      var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

      if(token) {

        _data.selectByField('token', {'id': token}, function(err, tokenData) {
          if(!err && tokenData) {
            if(tokenData.length == 1) {
              if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {

                // Verificar se o dono do token é administrador
                _data.selectByField('usuario', {'id': tokenData[0].id_usuario}, function(err, userData) {
                  if(!err && userData) {
                    if(userData.length == 1) {
                      if(userData[0].adm) {
                        // Já que é tudo válido e o usuário é administrador
                        if(imagem) {
                          //Pegar a extensão do arquivo
                          var index = imagem.originalFilename.split('.').length - 1;
                          var extensao = imagem.originalFilename.split('.')[index];
                          var nomeArquivo = id + '.' + extensao;
                          var novoCaminho = __dirname + '/../../storage/categorias/imagem/';
                          fs.access(novoCaminho + nomeArquivo, fs.F_OK, (err) =>{

                            if(!err){
                              callback(400, {'Error': 'Essa rota é para inserir uma imagem e não atualizá-la, para substituir a imagem atual utilize um PUT'});
                            }else {
                              _data.moverArquivo(nomeArquivo, imagem, novoCaminho, function(err) {

                                if(!err) {
                                  callback(200);
                                }else {
                                  callback(500, {'Error': 'Não foi possível fazer o upload da imagem, tente novamente'});
                                }

                              });

                            }
                          });
                        }

                      }else {
                        callback(400, {'Error': 'Usuário não autorizado a criar categorias'});
                      }
                    }else {
                      callback(400, {'Error': 'Usuário dono do token não existe'});
                    }
                  }else {
                    callback(500, {'Error': 'Não foi possível encontrar o usuário dono do token, tente novamente'});
                  }
                });

              }else {
                callback(400, {'Error': 'Token expirado'});
              }
            }else {
              callback(400, {'Error': 'Token inexistente'});
            }
          }else {
            callback(500, {'Error': 'Não foi possível procurar o token, tente novamente'});
          }
        });

      }else {
        callback(400, {'Error': 'Token não enviado'});
      }

    }else {
      callback(400, {'Error': 'Dado obrigatório não enviado (imagem)'});
    }

  }else {
    callback(400, {'Error': 'Dado obrigatório não enviado (id)'});
  }

};



// Arquivos Categoria - get
// Dados obrigatórios: id
// Dados opcionais: none
handlers.arquivos._categorias.get = function(data, callback) {

  // Conferir dados obrigatórios
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0 ? data.queryStringObject.id : false;

  if(id) {

    var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false;

    if(token) {

      _data.selectByField('token', {'id': token}, function(err, tokenData) {
        if(!err && tokenData) {
          if(tokenData.length == 1) {
            if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now()))) {
              // Prepara imagem para envio
              glob(__dirname + '/../../storage/categorias/imagem/' + id + '.*', {}, function(err, files) {
                if(!err && files) {
                  if(files.length == 1) {
                    var caminhoImagem = files[0];
                    callback(200, caminhoImagem);

                  }else {
                    callback(400, {'Error': 'A imagem desta categoria não existe, solicite ao administrador o upload da mesma'});
                  }
                }else {
                  callback(500, {'Error': 'Não foi possível encontrar o arquivo especificado, tente novamente ou verifique sua requisição'})
                }
              });
            }else {
              callback(400, {'Error': 'Token expirado'});
            }
          }else {
            callback(400, {'Error': 'Token não existe'});
          }
        }else {
          callback(500, {'Error': 'Não foi possível encontrar o token, tente novamente'});
        }
      });

    }else {
      callback(400, {'Error': 'Token não enviado'});
    }

  }else {
    callback(400, {'Error': 'Faltando dados obrigatórios(id)'});
  }
};



// arquivos Categoria - put
// Dados obrigatórios: id, imagem
// Dados opcionais: none
handlers.arquivos._categorias.put = function(data, callback) {

  // Conferir dados obrigatórios
  if(data.payload.fields.id){
    var id = typeof(data.payload.fields.id[0]) == 'string' && data.payload.fields.id[0].trim().length > 0 ? data.payload.fields.id[0].trim() : false;
  }
  if(data.payload.files.imagem){
    var imagem = typeof(data.payload.files.imagem[0]) == 'object' ? data.payload.files.imagem[0] : false;
  }
  // Conferir dados obrigatórios
  if(id) {

    if(imagem) {

      var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

      if(token) {

        _data.selectByField('token', {'id': token}, function(err, tokenData) {
          if(!err && tokenData) {
            if(tokenData.length == 1) {
              if(tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {


                // Verificar se o dono do token é administrador
                _data.selectByField('usuario', {'id': tokenData[0].id_usuario}, function(err, userData) {
                  if(!err && userData) {
                    if(userData.length == 1) {
                      if(userData[0].adm) {
                        // Já que é tudo válido e o usuário é administrador
                        if(imagem) {
                          //Pegar a extensão do arquivo
                          var index = imagem.originalFilename.split('.').length - 1;
                          var extensao = imagem.originalFilename.split('.')[index];
                          var nomeArquivo = id + '.' + extensao;
                          var novoCaminho = __dirname + '/../../storage/categorias/imagem/';
                          _data.moverArquivo(nomeArquivo, imagem, novoCaminho, function(err) {

                            if(!err) {
                              callback(200);
                              }else {
                                callback(500, {'Error': 'Não foi possível fazer o upload da imagem, tente novamente'});
                              }

                          });
                        }

                      }else {
                        callback(400, {'Error': 'Usuário não autorizado a criar categorias'});
                      }
                    }else {
                      callback(400, {'Error': 'Usuário dono do token não existe'});
                    }
                  }else {
                    callback(500, {'Error': 'Não foi possível encontrar o usuário dono do token, tente novamente'});
                  }
                });



              }else {
                callback(400, {'Error': 'Token expirado'});
              }
            }else {
              callback(400, {'Error': 'Token inexistente'});
            }
          }else {
            callback(500, {'Error': 'Não foi possível procurar o token, tente novamente'});
          }
        });

      }else {
        callback(400, {'Error': 'Token não enviado'});
      }

    }else {
      callback(400, {'Error': 'Dado obrigatório não enviado (imagem)'});
    }

  }else {
    callback(400, {'Error': 'Dado obrigatório não enviado (id)'});
  }

};



handlers._tokens.verificarToken = function(token, login, callback) {

  if(token && login) {

    // Verificar que o token existe
    _data.selectByField('token', { 'id': token }, function(err, tokenData) {
      if(!err && tokenData){
        if(tokenData.length == 1) {

          // Conferir se o token ainda é válido
          if( tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now()))) {
            // Procurar o usuário
            _data.selectByField('usuario', { 'login': login }, function(err, userData) {
              if(!err && userData) {
                if(userData.length == 1) {

                  // Conferir se o usuário é dono do token
                  if(userData[0].id === tokenData[0].id_usuario) {
                    callback(false);
                  } else {
                    callback({'code': 401, 'Error': 'Usuário não é proprietário do token'});
                  }

                }else {
                  callback({ 'code': 500, 'Error': 'Problemas ao encontrar o usuário, tente novamente' });
                }

              } else {
                callback({ 'code': 500, 'Error': 'Problemas ao encontrar o usuário, tente novamente' });
              }
            });

          } else {
            callback({ 'code': 404, 'Error': 'Token com validade expirada' });
          }

        } else {
          callback({ 'code': 500, 'Error': 'Possível duplicidade de tokens, tente novamente ou crie um novo token' });
        }

      }else {
        callback({ 'code': 500, 'Error': 'Problemas ao encontrar o token, tente novamente' });
      }
    });

  }else {
    callback({ 'code': 500, 'Error': 'Token não recebido' });
  }
};

// Export the handlers
module.exports = handlers;
