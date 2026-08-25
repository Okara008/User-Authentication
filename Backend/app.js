const express = require('express')
const app = express()
const cors = require('cors')
const mysql = require("mysql2");
require("dotenv").config()

const multer = require("multer");
const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")
const storage = multer.memoryStorage();
const upload = multer({ storage });

const bcrypt = require("bcrypt");
const session = require("express-session")
const fs = require('fs')

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

cloudinary.config({
    cloud_name: "oqdwhcdw",
    api_key: process.env.C_API_KEY,
    api_secret: process.env.C_API_SECRET,
});

app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use('/uploads', express.static('uploads'))

app.use(session({
    secret: process.env.SES_NAME,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        sameSite: 'none',
        httpOnly: true
    }
}))

const isAuthenticated = (req, res, next) => {
    if(!req.session.user){
        return res.status(401).json({"message": "401 User Unregistered"})
    }
    next()
}

const isAuthorised = (req, res, next) => {
    if(req.session.user.role.toLowerCase() != 'admin'){
        return res.status(403).json({"message": "403 User not Admin"})
    }
    next()
}

app.get('/', isAuthenticated, (req, res)=>{
    try{
        const {user} = req.query
        if(user.toLowerCase() == 'user'){
            db.query(
                "SELECT * FROM users WHERE username = ?",
                [req.session.user.username],
                (err, result) =>{
                    if (err) return res.status(500).json({"message": "An error occured"})
                    res.status(200).json(result)
                }
            )
        }
    }catch(error){
        res.status(500).json({"message": "Server Error"});
    }
})

app.get('/admin', isAuthenticated, isAuthorised, (req, res)=>{
    try{
        const {user, id} = req.query

        if(id){
            db.query(
                'SELECT * FROM users WHERE id = ?',
                [id],
                (err, result) => {
                    if (err) return res.status(500).json({"message": "Server Error"})
                    return res.status(200).json(result)
                }
            )
        }
        else{
            if(user.toLowerCase() == 'users'){
                db.query(
                    "SELECT * FROM users",
                    (err, result) => {
                        res.json(result);
                    }
                );
            }
            else if(user.toLowerCase() == 'admin'){
                db.query(
                    "SELECT * FROM users WHERE username = ?",
                    [req.session.user.username],
                    (err, result) =>{
                        if (err) return res.status(500).json({"message": "Server error"})
                        res.status(200).json(result)
                    }
                )
            }
        }
    }catch(error){
        res.status(500).json({"message": "Server error"});
    }
})

app.delete('/', isAuthenticated, isAuthorised, (req, res) => {
    const { id } = req.query
    try{
        db.query(
            'SELECT profile_pic FROM users WHERE id = ?',
            [id],
            (err, result) => {
                if(err)  {
                    return res.status(500).json({"message": "Server Error"})
                }
                const oldImage = result[0]?.profile_pic

                db.query(
                    "DELETE FROM users WHERE users.id = ?",
                    [id],
                    (err, result) => {
                        if(err) throw err
                        res.status(200).json(result)
                    }
                )

                if (oldImage) {
                    fs.unlink(oldImage, (err) => {
                        if (err) return res.status(500).json({"message": "Server Error"})
                    });
                }
                res.status(200).json({"message": "Deleted Successfully"})
            }
        )
    }catch(err){
        res.status(500).json({"message": "Server Error"});
    }
})

app.delete('/logout', async(req, res)=>{
    req.session.destroy((err) => {
        if (err) return res.status(500).json({"message": "Could not log out"})
        res.clearCookie("connect.sid")
        res.json({message: "Logged out successfully"})
    })
})

app.post('/signup', async(req, res)=>{
    try{
        let {email, username, password, role} = req.body
        username = username.trim()
        email = email.trim()
        password = password.trim()
        role = role.trim()
        
        if(!username || !password || !email || !role){
            return res.status(400).json({"message": "All fields must be filled"})
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.query(
            "INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)",
            [email, username, hashedPassword, role],
            (err, result) =>{
                if(err){
                    console.log(err);
                    if(err.message.startsWith("Duplicate entry")){
                        return res.status(409).json({"message": `Username "${username}" already exists`})
                    }
                    return res.status(500).json({"message": "Server Error"})
                }
                req.session.user = {
                    username: username,
                    role: role
                }
                res.status(200).json({"message": "User is Signed in", "isAdmin": (role.toLowerCase() == 'admin')})
        })
    }catch(error){
        res.status(500).json({"message": "Server Error"})
    }
})

app.post('/login', async(req, res)=>{
    try{
        let {username, password} = req.body
        username = username.trim()
        password = password.trim()
        
        if(!username || !password){
            return res.status(400).json({"message": "Empty username or/and password field"})
        }

        db.query(
        "SELECT username, password, role FROM users WHERE username = ?",
        [username],
        async (err, result) => {
            if (err) {
                return res.status(500).json({"message": "Server Error"})
            }
            if (result.length === 0) {
                return res.status(401).json({"message": "Invalid username or password"})
            }
            const hashedPassword = result[0].password
            
            const passwordCorrect = await bcrypt.compare(password, hashedPassword);
            
            if(!passwordCorrect){
                return res.status(401).json({"message": "Invalid username or password"})
            }

            req.session.user = {
                username: result[0].username,
                role: result[0].role
            }
            res.json({"isAdmin": (result[0].role.toLowerCase() == 'admin')})
        })
    }catch(error){
        res.status(500).json({"message": "Server Error"});
    }
})

app.post('/profile', isAuthenticated, upload.single("profile_pic"), async (req, res)=>{
    try{
        const { full_name, date_of_birth, email } = req.body
        
        const profile_pic = req.file ? `uploads/${req.file.filename}` : null
        
        if(!full_name  || !date_of_birth || !email){
            return res.status(400).json({"message": "All fields must be filled"})
        }

        if(profile_pic){
            db.query(
                'SELECT profile_pic_public_id FROM users WHERE username = ?',
                [req.session.user.username],
                async (err, result) => {
                    if(err) {
                        return res.status(500).json({"message": "Database Error"});
                    }

                    const oldImage = result[0]?.profile_pic_public_id

                    const streamUpload = (fileBuffer) => {
                        return new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { folder: "profile_pics" },
                                (error, result) => {
                                    if (result) resolve(result);
                                    else reject(error);
                                }
                            );
                            streamifier.createReadStream(fileBuffer).pipe(stream);
                        });
                    };
                    const result_pic = await streamUpload(req.file.buffer);
                    
                    db.query(
                    `UPDATE users SET full_name = ?, date_of_birth = ?, profile_pic_url = ?, profile_pic_public_id = ?, email = ? WHERE username = ?`,
                    [full_name, date_of_birth, result_pic.secure_url, result_pic.public_id, email, req.session.user.username],
                    async (err)=>{
                        if(err){
                            return res.status(500).json({"message": "Server Error"})
                        }
                        
                        if (oldImage) {
                            await cloudinary.uploader.destroy(oldImage);
                        }
                        res.status(200).json({'message': 'Updated Successfully',  profile_pic: profile_pic || null})
                    }
                    )
                }
            )
        }else{
            db.query(
                `UPDATE users SET full_name = ?, date_of_birth = ?, email = ? WHERE username = ?`,
                [full_name, date_of_birth, email, req.session.user.username],
                (err, result)=>{
                    if(err){
                        return res.status(500).json({"message": "Server Error"})
                    }
                    res.status(200).json({'message': 'Updated Successfully'})
                }
            )
        }

    }catch(error){
        res.status(500).json({"msg": "Server Error"});
    }
})

app.use((_, res) => res.status(404).json({"message": "404 Page Not Found"}))

app.listen(5000, ()=>{
    console.log("Server listening at port 5000...");
})