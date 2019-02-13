/*
 * Request Handlers
 *
 */

// Dependencies
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
// Dados obrigatórios: nome, sobrenome, login, senha, email
// Optional data: none
handlers._usuarios.post = function(data,callback){
  // Check that all required fields are filled out
  var nome = typeof(data.payload.nome) == 'string' && data.payload.nome.trim().length > 0 ? data.payload.nome.trim() : false;
  var sobrenome = typeof(data.payload.sobrenome) == 'string' && data.payload.sobrenome.trim().length > 0 ? data.payload.sobrenome.trim() : false;
  var login = typeof(data.payload.login) == 'string' && data.payload.login.trim().length > 0 ? data.payload.login.trim() : false;
  var senha = typeof(data.payload.senha) == 'string' && data.payload.senha.trim().length > 0 ? data.payload.senha.trim() : false;
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().indexOf('@') != -1 ? data.payload.email.trim() : false;

  if(nome && sobrenome && login && senha && email){


    // Make sure the user doesnt already exist
    _data.selectByField('usuario', {'login': login}, function(err, results){
      if(!err && results){
        if(results.length > 0){
          // Se retornou algum resultado, é porque usuário já existe
          callback(400, {'Error': 'Usuário já existe'});
          
        }else {

          _data.selectByField('usuario', {'email': email}, function(err, results){
            if(!err && results){
              if(results.length > 0){
                // Se retornou algum resultado, é porque usuário já existe  
                callback(400, {'Error': 'Usuário já existe'});         

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
                    'email': email
                  };
                  // Agora eu devo inserir o usuário no banco e retornar se consegui ou não
                  _data.insert('usuario', userData, function(err){
                    if(!err){
                      callback(200);
                    }else {
                      callback(500, {'Error': 'Não foi possível inserir o usuário, tente novamente'});
                    }
                  });

                }else callback(500, {'Error': 'Não foi possível encriptar a senha do usuário'});

              }
            // Se houver erro a consulta não foi completada
            }else callback(500, {'Error1': 'Não foi possível consultar o banco, tente novamente'});
          });

        }
      // Se houver erro a consulta não foi completada      
      }else{
        callback(500, {'Error2': 'Não foi possível consultar o banco, tente novamente'});
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
            delete data.senha;
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
                  console.log(err);
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
      if(!err && userData){// @TODO VERIFICAR ESSE IF E O PORQUE DE ELE NÃO DAR VERDDADEIRO
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
            _data.insert('token', tokenObject, function(err) {
              if(!err){
                callback(200, tokenObject);
              } else {
                callback(500, { 'Error' : 'Não foi possível criar o token, tente novamente' });
              }
            });
          }
           else {
            callback(400, { 'Error' : 'Senha incorreta'});
          }

        } else {
          callback(500, { 'Error': 'Problemas ao encontrar o usuário, tente novamente' });
        }
      } else {
        callback(400, { 'Error1' : 'Usuário não cadastrado' });
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


// Tokens - post
// Dados obrigatórios: login, senha
// Dados opcionais: none
handlers._tokens.post = function(data, callback){
  var login = typeof(data.payload.login) == 'string' && data.payload.login.trim().length > 0 ? data.payload.login.trim() : false;
  var senha = typeof(data.payload.senha) == 'string' && data.payload.senha.trim().length > 0 ? data.payload.senha.trim() : false;
  if(login && senha){
    // Procurar usuário com o login recebido
    _data.selectByField('usuario', {'login': login}, function(err,userData){
      if(!err && userData){// @TODO VERIFICAR ESSE IF E O PORQUE DE ELE NÃO DAR VERDDADEIRO
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
            _data.insert('token', tokenObject, function(err) {
              if(!err){
                callback(200, tokenObject);
              } else {
                callback(500, { 'Error' : 'Não foi possível criar o token, tente novamente' });
              }
            });
          }
           else {
            callback(400, { 'Error' : 'Senha incorreta'});
          }

        } else {
          callback(500, { 'Error': 'Problemas ao encontrar o usuário, tente novamente' });
        }
      } else {
        callback(400, { 'Error1' : 'Usuário não cadastrado' });
      }
    });
  } else {
    callback(400, { 'Error' : 'Missing required field(s).' });
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

            // Já que o token é válido, criar a categoria com o nome e descrição especificado
            _data.insert('categoria', {'nome': nome, 'descricao': descricao}, function(err) {
              if(!err){
                callback(200);
              }else {
                callback(500, {'Error': 'Não foi possível cadastrar a categoria, tente novamente'});
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
// Dados obrigatórios: id
// Dados opcionais: none
handlers._categorias.get = function(data, callback) {
  // Conferir os dados obrigatórios
  var id = typeof(data.queryStringObject.id) == 'string' ? data.queryStringObject.id : false;

  // Verificar que o id foi enviado
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
    callback(400, {'Error': 'Faltando dado obrigatório (id)'});
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

              _data.selectByField('categoria', {'id': id}, function(err, categoriaData) {
                if(!err && categoriaData) {
                  if(categoriaData.length == 1) {
                    //Atualiza os campos necessários
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

            _data.selectByField('categoria', {'id': id}, function(err, categoriaData) {
              if(!err && categoriaData) {
                if(categoriaData.length == 1) {
                  // Deleta a categoria no banco
                  _data.delete('categoria', {'id': id}, function(err) {
                    if(!err){
                      callback(200);
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
  if(id_categoria && id_categoria) {

    // Verificar se o token foi enviado
    var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
    
    if(token){

      _data.selectByField('token', {'id': token}, function(err, tokenData) {
        if(!err && tokenData) {
          if(tokenData.length == 1) {
            if( tokenData[0].validade >= helpers.jsDateToMysqlDate(new Date(Date.now())) ) {

              var cartaoData = {
                'id_categoria': id_categoria,
                'nome': nome
              };

              _data.insert('cartao', cartaoData, function(err) {
                if(!err) {
                  callback(200);
                }else {
                  callback(500, {'Error': 'Não foi possível cadastrar o cartão, tente novamente'});
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
// Dados obrigatórios: id
// Dados opcionais: none
handlers._cartoes.get = function(data, callback) {
  var id = typeof(data.queryStringObject.id) == 'string' ? data.queryStringObject.id : false;

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


  }else {
    callback(400, {'Error': 'Faltando dado obrigatório (id)'});
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


handlers._tokens.verificarToken = function(token, login, callback) {

  if(token && login) {

    // Verificar que o token existe
    _data.selectByField('token', { 'id': token }, function(err, tokenData) {
      if(!err && tokenData){ // Não está passando por essa condição, vou ver se é um "err"
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
