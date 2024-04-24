const Tought = require('../models/Tought')
const User = require('../models/User')
const { Op } = require('sequelize')
const { search } = require('../routes/toughtsRoutes')

module.exports = class ToughtController {

    static async dashboard(req, res) {
        const userId = req.session.userid

        const user = await User.findOne({
            where: {
                id: userId,
            },
            include: Tought,
            plain: true,
        })

        const toughts = user.Toughts.map((result) => result.dataValues)

        let emptyToughts = true

        if (toughts.length > 0) {
            emptyToughts = false
        }

        console.log(toughts)
        console.log(emptyToughts)

        res.render('toughts/dashboard', { toughts, emptyToughts })
    }

    static createTought(req, res) {
        res.render('toughts/create')
    }

    static createToughtSave(req, res) {
        const tought = {
            title: req.body.title,
            UserId: req.session.userid,
        }

        Tought.create(tought)
            .then(() => {
                req.flash('message', 'Pensamento criado com sucesso!')
                req.session.save(() => {
                    res.redirect('/toughts/dashboard')
                })
            })
            .catch((err) => console.log())
    }

    static showToughts(req, res) {
        console.log(req.query)

        // check if user is searching
        let search = ''

        if (req.query.search) {
            search = req.query.search
        }

        // order results, newest first
        let order = 'DESC'

        if (req.query.order === 'old') {
            order = 'ASC'
        } else {
            order = 'DESC'
        }

        Tought.findAll({
            include: User,
            where: {
                title: { [Op.like]: `%${search}%` },
            },
            order: [['createdAt', order]],
        })
            .then((data) => {
                let toughtsQty = data.length

                if (toughtsQty === 0) {
                    toughtsQty = false
                }

                const toughts = data.map((result) => result.get({ plain: true }))

                res.render('toughts/home', { toughts, toughtsQty, search })
            })
            .catch((err) => console.log(err))
    }
}