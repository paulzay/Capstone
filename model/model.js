// IMPORTS
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../dbconfig');
const config = require('../configs/cloudinaryConfig');
const multer = require('../midll/multer');

const { uploader } = config;
const { cloudinaryConfig } = config;
const { dataUri } = multer;
const { multerUploads } = multer;


const createUser = (request, response) => {
  // ADMIN CREDENTIALS
  const { adminEmail } = request.body;
  const { adminPassword } = request.body;


  const { firstName } = request.body;
  const { lastName } = request.body;
  const { email } = request.body;
  const { password } = request.body;
  const { gender } = request.body;
  const { jobRole } = request.body;
  const { department } = request.body;
  const { address } = request.body;
  const { isadmin } = request.body;

  pool.query('select employee_id, password,isadmin from Employee where email = $1 and isadmin = $2',
    [adminEmail, 't'], (error, results, fields) => {
      if (results.rows.length === 0) {
        response.status(401).json({ status: 'error', error: 'Admin user does not exist' });
      } else {
        const hash = results.rows[0].password.toString();
        bcrypt.compare(adminPassword, hash, (error, res) => {
          if (!res) {
            return response.status(401).json({ status: 'error', error: 'Invalid password' });
          }

          bcrypt.hash(password, (err, hash) => {
            pool.query('INSERT INTO Employee (firstName,lastName,email,password,gender,jobRole,department,address,isadmin ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
              [firstName, lastName, email, hash, gender, jobRole, department, address, isadmin], (error) => {
                if (error) {
                  response.status(400).json({ status: 'error', error: error.detail });
                }

                pool.query("select currval(pg_get_serial_sequence('Employee','employee_id')) as user_id",
                  (error, results, fields) => {
                    if (error) throw error;

                    const { user_id } = results.rows[0];
                    const token = jwt.sign({ user_id }, 'JWT_TOKEN', { expiresIn: '8h' });

                    response.status(201).json({
                      status: 'success',
                      data: {
                        message: 'User account successfully created',
                        token,
                        userId: user_id,
                      },
                    });
                  });
              });
          });
        });
      }
    });
};
const signIn = (request, res, next) => {
  const { username, password } = request.body;

  pool.query('select employee_id, password from Employee where email = $1',
    [username], (error, results, fields) => {
      if (results.rows.length === 0) {
        res.status(401).json({ status: 'error', error: 'user does not exist' });
      } else {
        const hash = results.rows[0].password.toString();
        bcrypt.compare(password, hash, (error, response) => {
          if (!response) {
            return res.status(401).json({ status: 'error', error: 'Invalid password' });
          }

          const user_id = results.rows[0].employee_id;

          const token = jwt.sign({ user_id }, 'JWT_TOKEN', { expiresIn: '24h' });


          res.status(200).json({
            status: 'success',
            data: {
              token,
              user_id,
            },
          });
        });
      }
    });
};

const postGif = (request, response) => {
  const file = dataUri(request).content;
  const { title } = request.body;
  const { employee_id } = request.body;

  return uploader.upload(file).then((result) => {
    const image = result.url;

    pool.query('INSERT INTO Gifs (imageUrl ,title,employee_id) VALUES ($1, $2,$3)',
      [image, title, employee_id], (error) => {
        if (error) {
          response.status(401).json({ status: 'error', error: error.detail });
        }

        pool.query("select currval(pg_get_serial_sequence('Gifs','gif_id')) as gif_id",
          (error, results, fields) => {
            if (error) throw error;

            const { gif_id } = results.rows[0];
            const now = new Date();

            response.status(201).json({
              status: 'success',
              data: {
                gifId: gif_id,
                message: 'GIF image successfully posted',
                createdOn: now,
                title,
                imageUrl: image,
              },
            });
          });
      });
  });
};

const createArticle = (request, response) => {
  const { title, article, employee_id } = request.body;


  pool.query('INSERT INTO Article (title, article, employee_id) VALUES ($1, $2, $3)',
    [title, article, employee_id], (error) => {
      if (error) {
        response.status(401).json({
          status: 'error',
          error: error.detail,
        });
      }

      pool.query("select currval(pg_get_serial_sequence('Article','article_id')) as article_id",
        (error, results, fields) => {
          if (error) throw error;

          const { article_id } = results.rows[0];
          const now = new Date();

          response.status(201).json({
            status: 'success',
            data: {
              message: 'Article successfully posted',
              articleId: article_id,
              createdOn: now,
              title,
            },
          });
        });
    });
};

const editArticle = (request, response) => {
  const articleId = parseInt(request.params.id);
  const { title, article, employee_id } = request.body;

  pool.query('UPDATE Article SET title = $1, article = $2 WHERE article_id = $3 AND employee_id = $4',
    [title, article, articleId, employee_id], (error, results) => {
      if (error) {
        response.status(401).json({ status: 'error', error: error.detail });
      }

      if (results.rowCount) {
        response.status(200).json({
          status: 'success',
          data: {
            message: 'Article successfully updated',
            title,
            article,
          },
        });
      } else {
        response.status(401).json({ status: 'error' });
      }
    });
};

const deleteArticle = (request, response) => {
  const articleId = parseInt(request.params.id);
  const { employee_id } = request.body;

  pool.query('DELETE FROM Article WHERE article_id = $1 AND employee_id = $2',
    [articleId, employee_id], (error, results) => {
      if (error) {
        response.status(401).json({ status: 'error', error: error.detail });
      }

      if (results.rowCount) {
        response.status(200).json({
          status: 'success',
          data: {
            message: 'Article successfully deleted',
          },
        });
      } else {
        response.status(401).json({ status: 'error' });
      }
    });
};

const deleteGif = (request, response) => {
  let articleId = parseInt(request.params.id);
  let { employee_id } = request.body;

  pool.query('DELETE FROM Gifs WHERE gif_id = $1 AND employee_id = $2',
    [articleId, employee_id], (error, results) => {
      if (error) {
        response.status(401).json({ status: 'error', error: error.detail });
      }

      if (results.rowCount) {
        response.status(200).json({
          status: 'success',
          data: {
            message: 'gif post successfully deleted',
          },
        });
      } else {
        response.status(401).json({ status: 'error' });
      }
    });
};

module.exports = {
  createUser,
  signIn,
  postGif,
  createArticle,
  editArticle,
  deleteArticle,
  deleteGif,
};
