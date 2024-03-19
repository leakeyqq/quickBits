const isLoggedIn = (req,res,next)=>{
    // req.user ? next() : res.sendStatus(401)
    req.user ? next() : res.redirect('/auth/google')
}

const isLoggedOut = (req,res,next)=>{
    if(!req.isAuthenticated()) return next(
        res.redirect('/')
    )
}

module.exports = {
    isLoggedIn, isLoggedOut
}