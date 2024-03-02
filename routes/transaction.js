const mongoose = require('mongoose')

const transactionSchema = mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    transactionType: {
        type: String,
        enum: [ "incoming", "outgoing" ],
        default: "incoming"
    },
    description: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }

},
    {
        timestamps: true
    }
)


module.exports = mongoose.model("transaction", transactionSchema)