import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  // check user if exists
  const q = "SELECT * FROM users WHERE username = ?";
  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(400).json("User already exists!");

    // hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    // create new user
    const q = "INSERT INTO users (`username`,`email`,`password`,`name`) VALUES  (?)";
    const values = [
        req.body.username,
        req.body.email,
        hashedPassword,
        req.body.name
    ];

    db.query(q, [values], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("User has been created successfully");
    });
  });
};

export const login = (req, res) => {
    const q = "SELECT * FROM users WHERE username = ?";

    db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if(data.length === 0) return res.status(400).json("User not found!");

    const checkPassword = bcrypt.compareSync(req.body.password, data[0].password);
    if(!checkPassword) return res.status(400).json("Wrong Password or Username!");

    const token = jwt.sign({id: data[0]}, "secretkey");

    const {password, ...others} = data[0];
    res.cookie("accessToken", token, {
        httpOnly: true,
    }).status(200).json(others);
    });
};

export const logout = (req, res) => {
    res.clearCookie("accessToken", {
        secure:true,
        sameSite:"none"
    }).status(200).json("User has been logged out!");
};
