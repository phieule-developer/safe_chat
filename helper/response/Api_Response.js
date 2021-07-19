module.exports = {
    ApiResponse: (res, status, message, data, version) => {
        let ans = {
            status,
            message,
            data,
            version
        }

        return res.status(status).send(ans);
    }
}