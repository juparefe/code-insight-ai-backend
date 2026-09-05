import { env } from "../../../../config/env.js";

import { BedrockAnalyzer } from "./bedrock-analyzer.js";

const analyzer = new BedrockAnalyzer(env.BEDROCK_MODEL_ID, env.AWS_REGION);

const context = {
  repository: {
    name: "express-api",
    sourceType: "GITHUB" as const,
  },
  summary: {
    totalFiles: 11,
    sourceFiles: 7,
    testFiles: 0,
    configurationFiles: 2,
    documentationFiles: 1,
  },
  technologies: {
    languages: [
      {
        name: "JavaScript",
        fileCount: 7,
        percentage: 100,
      },
    ],

    frameworks: [
      {
        name: "Express",
        confidence: 0.95,
        evidence: ["Dependency detected: express"],
      },
    ],

    dependencies: [
      {
        name: "express",
        version: "^4.17.1",
        type: "RUNTIME" as const,
      },
      {
        name: "monk",
        version: "^7.3.3",
        type: "RUNTIME" as const,
      },
    ],
  },
  components: [
    {
      type: "MIDDLEWARE" as const,
      name: "index",
      path: "src/middlewares/index.js",
      evidence: ["Path pattern detected: src/middlewares/index.js"],
    },
    {
      type: "ROUTE" as const,
      name: "employees",
      path: "src/routes/employees.js",
      evidence: ["Path pattern detected: src/routes/employees.js"],
    },
  ],
  endpoints: [
    {
      method: "GET",
      path: "/api/employees",
      file: "src/routes/employees.js",
      evidence: "router.get('/', ...)",
    },
    {
      method: "GET",
      path: "/api/employees/:id",
      file: "src/routes/employees.js",
      evidence: "router.get('/:id', ...)",
    },
    {
      method: "POST",
      path: "/api/employees",
      file: "src/routes/employees.js",
      evidence: "router.post('/', ...)",
    },
    {
      method: "PUT",
      path: "/api/employees/:id",
      file: "src/routes/employees.js",
      evidence: "router.put('/:id', ...)",
    },
    {
      method: "DELETE",
      path: "/api/employees/:id",
      file: "src/routes/employees.js",
      evidence: "router.delete('/:id', ...)",
    },
  ],
  importantFiles: [
    {
      path: "package.json",
      type: "PACKAGE_MANIFEST" as const,
      priority: "HIGH" as const,
    },
    {
      path: "README.md",
      type: "README" as const,
      priority: "HIGH" as const,
    },
  ],
  sourceFiles: [
    {
      path: "package.json",
      content:
        '{\r\n  "name": "express-api",\r\n  "version": "1.0.0",\r\n  "description": "",\r\n  "main": "server.js",\r\n  "scripts": {\r\n    "start": "node src/server.js",\r\n    "dev": "nodemon src/server.js"\r\n  },\r\n  "repository": {\r\n    "type": "git",\r\n    "url": "git+https://github.com/zagaris/express-api.git"\r\n  },\r\n  "author": "",\r\n  "license": "ISC",\r\n  "bugs": {\r\n    "url": "https://github.com/zagaris/express-api/issues"\r\n  },\r\n  "homepage": "https://github.com/zagaris/express-api#readme",\r\n  "dependencies": {\r\n    "body-parser": "^1.19.0",\r\n    "dotenv": "^10.0.0",\r\n    "express": "^4.17.1",\r\n    "helmet": "^4.6.0",\r\n    "joi": "^17.4.1",\r\n    "monk": "^7.3.3",\r\n    "morgan": "^1.10.0"\r\n  },\r\n  "devDependencies": {\r\n    "eslint": "^7.31.0",\r\n    "eslint-config-airbnb-base": "^14.2.1",\r\n    "eslint-plugin-import": "^2.23.4",\r\n    "nodemon": "^2.0.12"\r\n  }\r\n}\r\n',
    },
    {
      path: "readme.md",
      content:
        "# express api\r\n\r\nA simple REST API in Node.js\r\n\r\nAPI Endpoints\r\n\r\n| Methods     | Urls             |Description            |\r\n| ----------- | -----------      | -----------        |\r\n| GET         | api/employees    |Get all employees           |\r\n| GET         | api/employees/id |Get a specific employee         |\r\n| POST        | api/employees    |Create a new employee         |\r\n| PUT        | api/employees/id    |Update an existing employee|\r\n| DELETE        | api/employees/id    |Delete an existing employee|\r\n\r\n## Quick Start\r\n\r\nClone the repo.\r\n\r\n```bash\r\nhttps://github.com/zagaris/express-api.git\r\ncd express-api\r\n```\r\nCreate the .env file.\r\n\r\n```bash\r\nDB_URL = localhost/my-employees\r\nTEST_DB_URL = localhost/test-my-employees\r\nPORT = 5000\r\n```\r\nInstall the dependencies.\r\n\r\n```bash\r\nnpm install\r\n```\r\nTo start the express server, run the following.\r\n\r\n```bash\r\nnpm run dev\r\n```\r\n\r\nFor more details check [Build a Restful CRUD API with Node.js](https://dev.to/zagaris/build-a-restful-crud-api-with-node-js-2334).\r\n\r\n\r\n",
    },
    {
      path: "src\\middlewares\\index.js",
      content:
        "function notFound(req, res, next) {\r\n  res.status(404);\r\n  const error = new Error('Not Found', req.originalUrl);\r\n  next(error);\r\n}\r\n\r\nfunction errorHandler(err, req, res, next) {\r\n  res.status(res.statusCode || 500);\r\n  res.json({\r\n    message: err.message,\r\n    stack: err.stack,\r\n  });\r\n}\r\n\r\nmodule.exports = {\r\n  notFound,\r\n  errorHandler,\r\n};\r\n",
    },
    {
      path: "src\\routes\\employees.js",
      content:
        "/* eslint-disable consistent-return */\r\nconst express = require('express');\r\nconst schema = require('../db/schema');\r\nconst db = require('../db/connection');\r\n\r\nconst employees = db.get('employees');\r\n\r\nconst router = express.Router();\r\n\r\n/* Get all employees */\r\nrouter.get('/', async (req, res, next) => {\r\n  try {\r\n    const allEmployees = await employees.find({});\r\n    res.json(allEmployees);\r\n  } catch (error) {\r\n    next(error);\r\n  }\r\n});\r\n\r\n/* Get a specific employee */\r\nrouter.get('/:id', async (req, res, next) => {\r\n  try {\r\n    const { id } = req.params;\r\n    const employee = await employees.findOne({\r\n      _id: id,\r\n    });\r\n\r\n    if (!employee) {\r\n      const error = new Error('Employee does not exist');\r\n      return next(error);\r\n    }\r\n\r\n    res.json(employee);\r\n  } catch (error) {\r\n    next(error);\r\n  }\r\n});\r\n\r\n/* Create a new employee */\r\nrouter.post('/', async (req, res, next) => {\r\n  try {\r\n    const { name, job } = req.body;\r\n    await schema.validateAsync({ name, job });\r\n\r\n    const employee = await employees.findOne({\r\n      name,\r\n    });\r\n\r\n    // Employee already exists\r\n    if (employee) {\r\n      const error = new Error('Employee already exists');\r\n      res.status(409); // conflict error\r\n      return next(error);\r\n    }\r\n\r\n    const newuser = await employees.insert({\r\n      name,\r\n      job,\r\n    });\r\n\r\n    res.status(201).json(newuser);\r\n  } catch (error) {\r\n    next(error);\r\n  }\r\n});\r\n\r\n/* Update a specific employee */\r\nrouter.put('/:id', async (req, res, next) => {\r\n  try {\r\n    const { id } = req.params;\r\n    const { name, job } = req.body;\r\n    const result = await schema.validateAsync({ name, job });\r\n    const employee = await employees.findOne({\r\n      _id: id,\r\n    });\r\n\r\n    // Employee does not exist\r\n    if (!employee) {\r\n      return next();\r\n    }\r\n\r\n    const updatedEmployee = await employees.update({\r\n      _id: id,\r\n    }, { $set: result },\r\n    { upsert: true });\r\n\r\n    res.json(updatedEmployee);\r\n  } catch (error) {\r\n    next(error);\r\n  }\r\n});\r\n\r\n/* Delete a specific employee */\r\nrouter.delete('/:id', async (req, res, next) => {\r\n  try {\r\n    const { id } = req.params;\r\n    const employee = await employees.findOne({\r\n      _id: id,\r\n    });\r\n\r\n    // Employee does not exist\r\n    if (!employee) {\r\n      return next();\r\n    }\r\n    await employees.remove({\r\n      _id: id,\r\n    });\r\n\r\n    res.json({\r\n      message: 'Employee has been deleted',\r\n    });\r\n  } catch (error) {\r\n    next(error);\r\n  }\r\n});\r\n\r\nmodule.exports = router;\r\n",
    },
    {
      path: "src\\app.js",
      content:
        "const express = require('express');\r\nconst morgan = require('morgan');\r\nconst helmet = require('helmet');\r\nconst bodyParser = require('body-parser');\r\n\r\nconst { notFound, errorHandler } = require('./middlewares');\r\n\r\nconst app = express();\r\n\r\nrequire('dotenv').config();\r\n\r\napp.use(helmet());\r\napp.use(morgan('dev'));\r\napp.use(bodyParser.json());\r\n\r\nconst employees = require('./routes/employees');\r\n\r\napp.use('/api/employees', employees);\r\n\r\napp.use(notFound);\r\napp.use(errorHandler);\r\n\r\nmodule.exports = app;\r\n",
    },
    {
      path: "src\\server.js",
      content:
        "const app = require('./app');\r\n\r\nconst port = process.env.PORT || 8080;\r\napp.listen(port, () => {\r\n  console.log(`Listening on port ${port}`);\r\n});\r\n",
    },
  ],
};

const result = await analyzer.analyze(context);

console.log("\n===== CLAUDE RESPONSE =====\n");
console.log(result);
