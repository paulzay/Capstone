// IMPORTS
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../dbconfig');


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


module.exports = {
  createUser,

};
