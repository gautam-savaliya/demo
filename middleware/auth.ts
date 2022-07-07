import jsonwebtoken, { verify } from 'jsonwebtoken';
import db from '../models';
const User = db["User"];
import statusCode from '../config/statusCode';

function verifyToken(request:any, response:any, next:any) {
    let secret:any = process.env.SECRET;
    let token = request.headers["x-access-token"] || request.headers["authorization"] || request.headers["Authorization"];
	if (token) {
		token = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;
	} else {
		return response.sendStatus(statusCode.UNAUTHORIZED).send();
	}

	jsonwebtoken.verify(token, secret, async (err:any, decoded:any) => {

		if (!decoded || err) {
			return response.sendStatus(statusCode.UNAUTHORIZED).send();
		}
		const users = await User.findOne({
			where: {
				id: decoded.id
			}
		});
		if (!users) return response.status(statusCode.UNAUTHORIZED).send();

		request.user = users;
		next();
	});
}

export default verifyToken;