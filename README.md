RateMyStore is a role-based store rating web application that allows users to sign up, log in, and rate registered stores. Built using Next.js for the frontend, Express.js for the backend, and MySQL as the database, the system supports different user roles with role-specific access and functionality.

Features:-
Authentication & Roles
Single login system for all users.

Role-based access control for:-
System Administrator
Normal User
Store Owner

Normal User:-
Can sign up, log in, and update password.
View and search all registered stores.
Submit or update store ratings (range 1 to 5).

Store Owner:-
Can log in and update password.
View average rating of their store.
View list of users who rated their store.

System Administrator:-
Add new users (admins, normal users).
Add new stores and assign them to store owners.

Dashboard showing:-
Total number of users
Total number of stores
Total number of ratings
Search and filter users and stores by name, email, address, and role.

Tech Stack:-
Frontend: Next.js (React.js framework)
Backend: Express.js (Node.js)
Database: MySQL (Managed via MySQL Workbench)

Database Schema-

1. users Table
Field Type Description
id INT (PK) Unique identifier for user
name VARCHAR Full name (20-60 characters)
email VARCHAR User email (unique)
password VARCHAR Hashed password
role ENUM admin, user, owner
address VARCHAR(400) User address

2. stores Table
Field Type Description
id INT (PK) Unique store ID
name VARCHAR Store name
email VARCHAR Store owner's email
address VARCHAR Store address
owner_id INT (FK) Foreign key referencing users.id

3. ratings Table
Field Type Description
id INT (PK) Unique rating ID
user_id INT (FK) Foreign key referencing users.id
store_id INT (FK) Foreign key referencing stores.id
rating INT Rating value (1 to 5)
