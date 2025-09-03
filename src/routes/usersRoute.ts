import {Router} from "express"
import {userController} from "../controllers/usersController"
import {validateUserCredentials, validateUserUpdateCredentials} from "../utils/validationSchema"
import validateRequest from "../middlewares/validateRequest"

const router = Router()

router.post(
    "/register",
    validateUserCredentials,
    validateRequest,
    userController.registerUser
)

router.post(
    "/login",
    userController.loginUser
)

// Update user
router.post("/reset-password",
    validateUserUpdateCredentials,
    validateRequest,
    userController.updateUser);
export default router;