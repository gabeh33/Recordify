# Routes Documentation

This document provides an overview of the routes available in the application, along with their HTTP methods, descriptions, required parameters, and responses.

---

## Table of Contents

1. [General Routes](#general-routes)
2. [User Routes](#user-routes)
3. [Product Routes](#product-routes)

---

## General Routes

### `GET /`
- **Description**: Redirects user to /home.
- **Required Parameters**: None
- **Response**:
  ```json
  {
    "message": "Welcome to the API"
  }
