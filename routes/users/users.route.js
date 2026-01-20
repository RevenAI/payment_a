import usersController from "../../controller/users/users.controller.js"
import { router } from "../routers.js"

/**
 * Predefined user routes to avoid repeating strings.
 */
const USER_ROUTES = {
    GET_ALL: '/users',
    GET_SINGLE: '/users/:userId',
    POST: '/users',
    PUT: '/users/:userId',
    PATCH: '/users/:userId',
    DELETE: '/users/:userId',
}

/**
 * userRouter
 *
 * Handles all HTTP routes related to the "users" resource.
 * Delegates requests to UsersController methods based on HTTP method and path.
 *
 * @param {import('http').IncomingMessage} req - Node.js request object
 * @param {import('http').ServerResponse} res - Node.js response object
 * @returns {Promise<boolean>} Returns true if route matched and was handled
 */
export const userRouter = async (req, res) => {

    // -------------------------
    // GET /users - Fetch all users
    // -------------------------
    if (router.isGetRoute(req, USER_ROUTES.GET_ALL)) {
        /**
         * @route GET /users
         * @access Public
         * @returns {Promise<void>}
         */
        await router.get(req, res, USER_ROUTES.GET_ALL, usersController.getUsers)
        return true
    }

    // -------------------------
    // GET /users/:userId - Fetch a single user
    // -------------------------
    if (router.isGetRoute(req, USER_ROUTES.GET_SINGLE)) {
        /**
         * @route GET /users/:userId
         * @access Public
         * @param {number} req.ids.userId - User ID from route parameters
         * @returns {Promise<void>}
         */
        router._attachIdsToRequest(req, USER_ROUTES.GET_SINGLE, req.params)
        await router.get(req, res, USER_ROUTES.GET_SINGLE, usersController.getUser)
        return true
    }

    // -------------------------
    // POST /users - Register new user
    // -------------------------
    if (router.isPostRoute(req, USER_ROUTES.POST)) {
        /**
         * @route POST /users
         * @access Public
         * @param {Object} req.body - User data payload
         * @param {string} req.body.firstName
         * @param {string} req.body.lastName
         * @param {string} req.body.email
         * @param {string} req.body.phone
         * @param {string} req.body.gender
         * @param {string} req.body.dob
         * @returns {Promise<void>}
         */
        await router.post(req, res, USER_ROUTES.POST, usersController.registerUser)
        return true
    }

    // -------------------------
    // PUT /users/:userId - Update existing user entirely
    // -------------------------
    if (router.isPutRoute(req, USER_ROUTES.PUT)) {
        /**
         * @route PUT /users/:userId
         * @access Public
         * @param {number} req.ids.userId - User ID from route parameters
         * @param {Object} req.body - Updated user data payload
         * @returns {Promise<void>}
         */
        router._attachIdsToRequest(req, USER_ROUTES.PUT, req.params)
        await router.put(req, res, USER_ROUTES.PUT, usersController.updateUser)
        return true
    }

    // -------------------------
    // PATCH /users/:userId - Partially update user
    // -------------------------
    if (router.isPatchRoute(req, USER_ROUTES.PATCH)) {
        /**
         * @route PATCH /users/:userId
         * @access Public
         * @param {number} req.ids.userId - User ID from route parameters
         * @param {Object} req.body - Partial update payload
         * @returns {Promise<void>}
         */
        router._attachIdsToRequest(req, USER_ROUTES.PATCH, req.params)
        await router.patch(req, res, USER_ROUTES.PATCH, usersController.updateUser)
        return true
    }

    // -------------------------
    // DELETE /users/:userId - Delete user
    // -------------------------
    if (router.isDeleteRoute(req, USER_ROUTES.DELETE)) {
        /**
         * @route DELETE /users/:userId
         * @access Public
         * @param {number} req.ids.userId - User ID from route parameters
         * @returns {Promise<void>}
         */
        router._attachIdsToRequest(req, USER_ROUTES.DELETE, req.params)
        await router.delete(req, res, USER_ROUTES.DELETE, usersController.deleteUser)
        return true
    }

    // No route matched, allow 404 handling
    return false
}
