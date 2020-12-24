import url from 'url';
import db from '../FakeDatas'; // fake user data

const IndexUserApi = (request, response) => {
  let method = request.method;
  let urlObject = url.parse(request.url, true);
  let query = urlObject.query;

  switch (method) {

    case "POST":
      if (isEmpty(query)) {
        createUser(request, response);
      } else {
        notSupport(response);
      }
      break


    case "GET":
      if (isEmpty(query)) {
        getAll(request, response);
      } else if (query.id) {
        getOne(response, query.id);
      } else {
        notSupport(response);
      }
      break


    case "PUT":
      if (isEmpty(query)) {
        updateUser(request, response)
      } else {
        notSupport(response);
      } 
      break


    case "DELETE":
      if (isEmpty(query)) {
        deleteUser(request, response);
      } else {
        notSupport(response);
      }
      break


    default:
      response.writeHead(400, { 
        "Content-type": 'application/json',
        // 'Allow': 'GET'
      })
      response.write(JSON.stringify({ message: 'Invalid Method'}));
      response.end();
  }
}

export default IndexUserApi;


function notSupport(response) {
  response.writeHead(404, { "Content-type": 'application/json' })
  response.write(JSON.stringify({ message: 'The request API URL is not supported by the server'}));
  response.end();
}


function getOne(response, id) {
  const result = { msg: 'USER GET ONE -> ' + id };
  response.writeHead(200, { 
    'Content-Length': JSON.stringify(result).length,
    "Content-type": 'application/json' 
  });
  response.write(JSON.stringify(result));
  response.end();
}


// apply cookie for cookie example 
function getAll(request, response) {
  let result = { msg: 'USER GET ALL' }
  let cookies = request.headers.cookie;
  let jsonCookies = parseCookies(cookies);

  // check if client has cookie
  if (cookies !== undefined) {
    result = { ...result, lastConnection: jsonCookies.last_connection }
    response.writeHead(200, { 
      'Content-Length': JSON.stringify(result).length,
      'Content-type': 'application/json',
      'Set-Cookie': [ 
        `last_connection=${new Date().toGMTString()}`, 
        `Max-Age=${60*60*24*30}` 
      ]
    });
    response.write(JSON.stringify(result));
    response.end();
  } else {
    response.writeHead(200, { 
      'Content-Length': JSON.stringify(result).length,
      'Content-type': 'application/json',
      'Set-Cookie':[
        "path=/user; httpOnly=true", // only use this cookie if protocol is http and url path /user
        `last_connection=${new Date().toGMTString()}`, 
        `Max-Age=${60*60*24*30}`, // set cookie's survival time and use when you want to delete cookie
      ]
    });
    response.write(JSON.stringify(result));
    response.end();
  }
}




// client rquest need body => id, name
async function createUser(request, response) {
  try {
    await BodyParser(request);

    console.log( db ); // just check before insert data
    db.push(request.body); // Do insert DB job
    console.log( db ); // just check after insert data
  
    response.writeHead(201, { 
      "Location": "/user",      // resource url where data was stored
      "Content-Type": "application/json" 
    })
    response.write(JSON.stringify(request.body))
    response.end();

  } catch (error) {
    response.writeHead(400, { "Content-type": "application/json" });
    response.write(JSON.stringify({ 
      message: 'Invalid body data was provided',
      description: error
    }));
    response.end();
  }
}



// client rquest need body => id, name
async function updateUser(request, response) {
  try {
    await BodyParser(request);

    console.log( db ); // just check before update data
    // do Update DB job
    db.map(a => {
      if (a.id === request.body.id) a.name = request.body.name;
    });
    console.log( db ); // just check after update data

    response.writeHead(204, { "Content-Type": "application/json" });
    response.end();

  } catch (error) {
    response.writeHead(400, { "Content-type": "application/json" });
    response.write(JSON.stringify({ 
      message: 'Invalid body data was provided',
      description: error
    }));
    response.end();
  }
}




// client rquest need body => id
async function deleteUser(request, response) {
  try {
    await BodyParser(request);

    console.log( db ); // just check before update data

    // do delete DB job
    let idx = 0;
    db.map(a => {
      if (a.id === request.body.id) idx = db.indexOf(a);
    });
    if (idx > -1) db.splice(idx, 1)

    console.log( db ); // just check after update data

    response.writeHead(204, { "Content-Type": "application/json" });
    response.end();

  } catch (error) {
    response.writeHead(400, { "Content-type": "application/json" });
    response.write(JSON.stringify({ 
      message: 'Invalid body data was provided',
      description: error
    }));
    response.end();
  }
}



async function BodyParser(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('error', error => reject( error ));
  
    request.on('data', (chunk) => { 
      console.log('%d bytes of post data', chunk.length); 
      body += chunk; 
    });
  
    request.on('end', () => {
      request.body = JSON.parse(body);
      resolve();
    });
  })
}


function isEmpty(param) {
  return Object.keys(param).length === 0;
}

function parseCookies(cookie) {
  return cookie
      .split(';')
      .map( v => v.split('=') )
      .map( ([k, ...vs]) => [k, vs.join('=')] )
      .reduce( (acc, [k,v]) => {
          acc[k.trim()] = decodeURIComponent(v);
          return acc;
      }, {});
}
