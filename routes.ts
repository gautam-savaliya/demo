import express from 'express'
import  { UserController } from './controller/user/user.controller'
import  { PaymentController } from './controller/payment/payment.controller'
import  { GroupController } from './controller/group/group.controller'


const router = express.Router();
import verifyToken from './middleware/auth'
import multer from 'multer';
import mkdrip from 'mkdirp'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var userdirpatha = "public/uploads/image/"
        mkdrip(userdirpatha)
        cb(null, userdirpatha)
    },
    filename: function (req, file, cb) {
        console.log('userdirpatha', file.originalname);

        cb(null, file.originalname)
    }
});
const uploads = multer({ storage: storage })

router.post('/register',  uploads.single("image"), UserController.register)
router.post('/login',UserController.login)
router.post('/forgotPassword', UserController.forgotPassword)
router.post('/resetPassword', UserController.resetPassword)
router.post('/user-list', UserController.getUser)
router.post('/checkout',verifyToken, PaymentController.checkOut)
router.post('/refundPayment', PaymentController.refundPayment)
router.post('/capturePayment', PaymentController.capturePayment)
router.post('/add-group', GroupController.addGroup)
router.post('/group-list', GroupController.GroupList)
router.post('/add-user-group', GroupController.addUserInGroup)
router.post('/requst-accept', UserController.acceptRequset)
router.get('/group-member-list/:id', GroupController.groupUser)
router.post('/request-group-list', GroupController.requstGrouopList)
// router.get('/previous-group-chat/:id', GroupController.previousChat)
router.post('/search', UserController.searchUser)
router.post('/requset-single-user', UserController.requsetSingleUser)
router.post('/request-friend-list', UserController.requsetFriendList)
router.post('/friend-list', UserController.friendList)
router.post('/chat-history', GroupController.chatHistory)
router.post('/check-group-user', GroupController.checkGroupUser)
router.post('/chat-image', uploads.array("files"), GroupController.uploadsImges)
router.post('/clear-chat', GroupController.clearChat)
router.post('/leve-Group', GroupController.leaveGroup)















export default router;