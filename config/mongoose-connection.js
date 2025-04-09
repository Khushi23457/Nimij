const mongoose=require('mongoose');
const dgbr=require('debug')('app:mongoose');
const config=require('config')

const dbURI =  process.env.MONGODB_URI || `${config.get("MONGODB_URI")}/${process.env.NODE_ENV === 'test' ? 'bagshop-test' : 'bagshop'}`;
mongoose.connect(dbURI)
.then(function(){
   dgbr(`Connected to MongoDB in ${process.env.NODE_ENV} mode`);
})
.catch(function(err){
   dgbr(err);
})

module.exports=mongoose.connection;