const CollegeContacts=require('./cosmos/admin')
module.exports=CollegeContacts;
const Item=require('./cosmos/dummydata')
const kpr=new CollegeContacts()
async function init() {
    await kpr.deleteDatabase()
}
init()

//Basic     console.log(kpr.info)

//Database Methods
    // await kpr.createDatabase()
    // await kpr.readDatabase()
    // await kpr.listAllDatabase()
    // await kpr.deleteDatabase()

//ContainerMethods
    // await kpr.createContainers() // !use use await kpr.createContainer() 
    // await kpr.listAllContainers()
    // await kpr.scaleContainer(0,500)
    // let info=await kpr.getContainerInfo(0)
    // console.log(info)

//Item Methods 
    // await kpr.insertDataIntoContainer(0,Item)
    // let info=await kpr.getAllItemIdsOfContainer(0)
    // console.log(info)
    //await kpr.queryItemFromContainer('DepartmentOfComputerScience-III')
    //await kpr.replaceItemInContainer(0,"DepartmentOfComputerScience-III",Item)
    //await kpr.deleteItemFromContainer(0,"DepartmentOfComputerScience-II")

// Add New Functions in future