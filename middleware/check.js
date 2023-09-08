exports.password = (req, res, next) => {
    const checkPswd = function(pswd) {
        let pswdFormat = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{12,}$/
        if(pswd !== '' && pswd.match(pswdFormat)){
            next();
        }
        else{
            res.status(401).json({error: 'Le mot de passe doit contenir au moins 12 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial'});
        }
    }
    checkPswd(req.body.password)
};