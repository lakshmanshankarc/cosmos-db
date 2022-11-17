
const {CosmosClient}=require('@azure/cosmos')
const config=require('../config')
const { id } = require('./dummydata')
const dummy=require("./dummydata")
class CollegeContacts{
    //Private Variables ensures that object of this Class cannot access to private Variables but can access the public methods
    #endpoint          
    #privateKey
    #database
    #partionKeys
    #containers
    #client
    #newItems
    /**
     * <br> CollegeContacts is the class which is used to manipulate the Azure Cosmos DB
     * 
     * 
     * CollegeContacts class wraps all the complexities of managing the cosmos db helps developers to easily manipulate the data from the Cosmos DB
     * 
     * 
     * Things to Do before calling the Methods of this class:
     * 
     * If you are using own config file import that file
     * You need to import the config file
     * or You can change the values in config.js for your azure Cosmos DB values
     * ```js
     * const CollegeContacts=require("@lakshmanshankar/college-contacts")
     * const config=require("/path/toconfig") //or you can change the values in config.js file in the root directory
     * // use async calls instead of promises
     * 
     * const kpr=new CollegeContacts()
     * 
     * async function init(){
     * await kpr.createDatabase() //call the methods here
     * }
     * ```
     * 
     * If you are not sure about any method please hover on the method to know about the parameters and extra details on how to use those methods
     * 
     */
    constructor(){
        this.#endpoint=config.endpoint
        this.#privateKey=config.key
        this.#database=config.database.id
        this.#containers=[...config.containers.ids]
        this.#partionKeys=config.partionkeys.ids
        this.#newItems=dummy
        this.#client=new CosmosClient({
            endpoint:this.#endpoint,
            key:this.#privateKey,
        })
        this.info={
            name:"CosmosDB Controll Nodejs",
            config:"Configuration for this file is in config.js file, please be carefull while making changes to the config file",
            title:"Cosmos Config"

        }
    }

    /**
     * This createDatabase method is used to create a Database in azure Cosmos DB account
     * @returns {String}Create Database will return the id of the database created in Azure cosmosDB
     * 
     * You don't have to give any arguments to this function. Name of the database is already imported from config
     * 
     * 
     * Syntax:
     * ```js
     * async function init(){
     * 
     * await kpr.createDatabase()
     * 
     * }
     * ```
     */
    async createDatabase(){
        let {database} = await this.#client.databases.createIfNotExists({
            id:this.#database
        })
        console.log(`Successfully created database ${database.id}`)
        return database.id
    }

    /**
     * this readDatabase method is used to return the ID of the database
     * @returns {String} Return the id of the database
     */
    async readDatabase(){
        let {resource:database}=(await this.#client.database(this.#database).read())
        console.log(`status:[Success] read databse ${database.id}`)
        return database.id
    }

    /**
     *  listAllDatabase() function in CollegeContacts class is used to fetch the list of available databsess
     *  and simply log the output in the console
     */
    async listAllDatabase(){
        let resource=await (await this.#client.databases.readAll().fetchAll()).resources
        console.log("List of available Databases")
        resource.map((x)=>{
            console.log(x.id)
        })
    }

    /**
     * deleteDatabase function is used to delete the database in defined in config file
     * @returns {String} Return the id of the database Deleted
     */
    async deleteDatabase(){
        let {database} =await this.#client.database(this.#database).delete()
        console.log(`Status:[deleted] Database ${database.id}`)
        return database.id
    }


    // That's it for Database Now Move on to containers
    /**
     * This createContainers method is used to create containers in Azure Cosmos DB
     *  Syntax:
     * ```js
     *   async function init(){
     *      await kpr.createContainers()
     *   }
     * ```
     * 
     * When you create a container this method will also create a Indexing Item which is used to store the container Items index.
     * This will also create an Indexing DB if you dont want the indexing DB you can delete that
     * 
     * But It is recommended to keep the Item for cheap operation on getting the index for All Items in the Container
     */
    async createContainers(){
        this.#containers.map(async (containerId,i)=>{
        let data=await this.createContainer(containerId,this.#partionKeys[i])
        let {item}=await this.#client.database(this.#database).container(this.#containers[i]).items.upsert({
            id:"ContainerIndexItem",
            ItemIndex:[]
        })
        console.log(`Successfully Created Container ${data} with Item${item.id}`)
        })
    }


    /**
     * ***      Important Info Using this method to create containers is not prefered              ***         
     * This createContainer method is internal method instead of calling createContainer 
     * function you can use createContainers() that function will internally calls this createContainer() 
     * @param {String} containerId Creates a Container with this Id
     * @param {String} PartionKey Create A container with this partionKey
     * @returns {String} ContainerId is returned
     * 
     * ```js
     * import {CollegeContacts} from "@lakshmanshankar/college-contacts"    //ES6 module
     * or
     * const CollegeContacts=require('@lakshmanshankar/college-contacts') //nodejs
     * 
     * 
     * async function main(){
     * var kpr=new CollegeContacts()
     * await kpr.createContainer()  // Throws Error Expecting two arguments
     * await kpr.createContainers() //This method is not createContainer but it will call createContainer method Intenally
     * }
     * 
     * ```
     * 
     */
    async createContainer(containerId,PartionKey){
        let {container}=await this.#client.database(this.#database).containers.createIfNotExists({id:containerId,partitionKey:PartionKey})
        console.log(`status :[Success] Created container ${container.id}`)
        return container.id
    }


    /**
     * listAllContainer function will simply returns the list of available containers in the database
     * @return {Null} print the list of Available containers
     * syntax:
     * ```js
     * async function init(){
     * await kpr.listAllContainers()
     * }
     * ```
     */
    async listAllContainers(){
        var {resources:containers}= await (await this.#client.database(this.#database).containers.readAll().fetchAll())
        console.log("List of Available containers \n Container \t Index")
        containers.map((container,id)=>{
            console.table(` ${container.id} \t\t  ${id}`)
        })
    }

    /**
     * Using this method you can scale the container upto the certain limit of your azure cosmos DB account. to increase it Further go to cosmosDB and chnage Maximum RU/s.
     * 
     * By Default 1000 RU/s is free and you can freely extend to a maximum of 1000 RU's.This is for the enitre azure cosmos DB account Not for a container
     * 
     * Go to Cosmos DB change RU/s to Number you want 
     * 
     * ! Warning This may result addtional charges but mandatory when handling large Requests 
     * 
     * @param {Number} containerIndex Index Value of the container you want to change If you dont know the Index of the Container then use listAllContainers() to know the index
     * @param {Number} throughputForContianer Throughput for the container Valid Ranges starting from 400 - N incremented by 100s only ex (400 or 800 or 1200)
     * 
     * Example:
     * ```js
     * //Use only with asynchrounous functions because of returning promises
     * async fucntion main(){
     * var kpr= new KPRContacts()
     * await kpr.scaleContainer(0,500)
     * }
     * 
     * ```
     */
    async scaleContainer(containerIndex,throughputForContianer){
       var {resource:containerThroughput}=await this.#client.database(this.#database).container(this.#containers[containerIndex]).read()
       try {
            var {resources}=await this.#client.offers.readAll().fetchAll()
            for (const resource of resources){
                if (resource.offerResourceId !== containerThroughput._rid) {
                    continue
                }
                resource.content.offerThroughput=throughputForContianer;
                const offerToReplace=this.#client.offer(resource.id)
                await offerToReplace.replace(resource)
                console.log(`Updated offer to ${throughputForContianer} RU/s for Container ${this.#containers[containerIndex]}\n`);
                break;
            }
       } catch (err) {
            if (err.code == 400)
            {
                console.log(`Cannot read container throuthput.\n`);
                console.log(err.body.message);
            }
            else 
            {
                throw new Error("Cannot Scale the Container Throughput,Please check in Azure Portal");
            }
       }
    }

    /**
     * This deleteContainer Method will delete the container and its items from CosmosDB 
     * please ensure that you did really want to delete this 
     * @param {Number} containerIndex Index Value of the container you want to change If you dont know the Index of the Container then use listAllContainers() to know the index
     * @return {Null} log the container is deleted or not
     * ```js
     * 
     * async init(){
     * await kpr.deletecontainer(0) //ContainerIndex is based on the Number of Containers you want to create in config.js file
     * }
     */
    async deleteContainer(containerIndex){
        const deleted=(this.#containers)
        var s=await this.#client.database(this.#database).container(this.#containers[containerIndex]).delete()
        console.log(`Successfully Deleted Container ${deleted}`)
    }
    /**
     * getContainerInfo() method is used to get Information about the contianer
     * @param {Number} containerIndex Index of the container Not sure about the index, Then use listAllContainers()
     * @returns {Object} Object containing basic Information about the container
     * 
     * 
     * ```js
     * 
     * async function init(){
     * let info=await kpr.getContainerInfo(0) //Here 0 is the Index of the containe for yours use listAllContainers()
     *
     * }
     * 
     * ```
     */
    async getContainerInfo(containerIndex){
        const {resource:response}=await this.#client.database(this.#database).container(this.#containers[containerIndex]).read()
        var {resources}=await this.#client.offers.readAll().fetchAll()
        let maxThroughputEverProvisioned=0
        let offereredThroughput=0
        resources.map((x)=>{
            offereredThroughput=x.content.offerThroughput,
            maxThroughputEverProvisioned=x.content.offerMinimumThroughputParameters
        })
        var details={
            nameOfContainer:response.id,
            PartionKey:response.partitionKey,
            database:this.#database,
            maxThroughput:maxThroughputEverProvisioned,
            currentThroughput:offereredThroughput,
            conflictResolutionPolicy:response.conflictResolutionPolicy,
            _rid:response._rid,
            _etag:response._etag,
            _self:response._self,
            _ts:response._ts
        }
        return details
    }


    //That's It for Containers Now lets insert some data and manipulate them
    /**
     * insertDataIntoContainer method is used to insert Items into the Container in CosmosDB
     * @param {Number} indexOfContainer Index of the container Not sure about indices use listAllContainers()
     * @param {Object} DataToBeInserted Object contains the Values you want to insert into the Item
     */
    async insertDataIntoContainer(indexOfContainer,DataToBeInserted){
        let {item}=await (await this.#client.database(this.#database).container(this.#containers[indexOfContainer]).items.upsert(DataToBeInserted))
        this.handleChangesInIndex(indexOfContainer,item)
        console.log(`Successfully Inserted Item ${item.id}`)
    }


    /**
     * handleChangesInIndex is an Internal Method using this method is not recommended
     * handleChangesInIndex method will help you to get the list of all the items id without performing a costliest operation of querying all the items.
     * @param {Number} indexOfContainer Index of the container where you want to insert the Item
     * @param {Number} item Reference to the item id to update the ContainerIndexItem
     */
    async handleChangesInIndex(indexOfContainer,item){
        let {resource}=await this.#client.database(this.#database).container(this.#containers[indexOfContainer]).item("ContainerIndexItem").read()
        let temp=(resource.ItemIndex)
        temp.push(item.id)
        resource.ItemIndex=temp
        resource.ItemIndex=this.removeDuplicates(resource.ItemIndex)
        let index=await this.#client.database(this.#database).container(this.#containers[indexOfContainer]).item("ContainerIndexItem").replace(resource)
        console.log(`Successfully modified the ContainerIndexItems`)
    }
    /**
     * Accepts an array with Duplicate Values and Retrurn an Array without duplicate Values
     * @param {Array} arr Array containing duplicate Values
     * @returns {Array} Array with no duplicate values
     */
    removeDuplicates(arr){
        var unique = [];
        arr.forEach(element => {
            if (!unique.includes(element)) {
                unique.push(element);
            }
        });
        return unique;
    }
    /**
     * List all the Item Id for a given container 
     * @param {Number} ContaineIndex Index of the Container if You don't about the indices use 
     * @returns {Array} Array containing all the Available Item ID's for given container
     */
    async getAllItemIdsOfContainer(ContaineIndex){
        let {resource}=await this.#client.database(this.#database).container(this.#containers[ContaineIndex]).item("ContainerIndexItem").read()
        console.log("Method will return Value")
        return resource.ItemIndex
    }

    /**
     * This query from container is one of the most important method in KPRContacts this method is used to fetch the data stored in the Azure Cosmos DB
     * Cosmos DB is both Read And Write Intensive It can handle complex workload 
     * @param {String} IdOfTheItem Name of the ID Item in the container Not sure about ID's We have a good Solution for You use getAllIdsOfContainer()
     * Unique Queries Will be Updated in Future
     */
    async queryItemFromContainer(IdOfTheItem,ObjectOfUser){
        const querySpec = {
            query: `SELECT * FROM data WHERE data.id = "${IdOfTheItem}"`,
          }
        var {resources:queryParams}=await this.#client.database(this.#database).container(this.#containers[0]).items.query(querySpec).fetchAll()
        queryParams.map((x)=>{
            console.log(x)
        })
    }


    /**
     * Replace the Item for the Given contianer with the new Item body
     * @param {Number} ContainerIndex Index of the container you want to update the item
     * This method is used to Update the Items of the Contianer Need to replace the entire object
     */
    async replaceItemInContainer(ContainerIndex,IdOfTheItem,newItem){
        let {resource}=await this.#client.database(this.#database).container(this.#containers[0]).item(IdOfTheItem).replace(newItem)
        this.handleChangesInIndexMid(ContainerIndex,await this.removeOldAddNewIds(IdOfTheItem,resource.id,await this.getAllItemIdsOfContainer(ContainerIndex)))
        console.log(`Status:[Success]: Updated Items of the contianer ${this.#containers[ContainerIndex]}`)
    }

    /**
     * Internal Method which is used to update the ContainerIndexItem
     * @param {*} ContaineIndex 
     * @param {*} NewItemArrray 
     */
    async handleChangesInIndexMid(ContaineIndex,NewItemArrray){
        let {resource}=await this.#client.database(this.#database).container(this.#containers[ContaineIndex]).item("ContainerIndexItem").read()
        resource.ItemIndex=NewItemArrray
        let index=await this.#client.database(this.#database).container(this.#containers[ContaineIndex]).item("ContainerIndexItem").replace(resource)
        console.log(`Status ContainerIndexItems modified`)
    }

    /**
     * This method is also and Internal Method.
     * Using this method in your program might caused issues
     * @param {Number} oldVal Old ID for the Item
     * @param {Number} NewVal New ID for the Item
     * @param {Array} iterable An iterable list of available ID's for the Items in COSMOS DB 
     * @returns {Array} returns an array containing new value in place of the old value
     */
    removeOldAddNewIds(oldVal,NewVal,iterable){
        let temp=[]
        iterable.map((iterator)=>{
            if (iterator == oldVal){
                temp.push(NewVal)
            }else{
                temp.push(iterator)
            }
        })
        return temp
    }

    async deleteItemFromContainer(ContainerIndex,IdOfTheItem){
        let {item}= await this.#client.database(this.#database).container(this.#containers[ContainerIndex]).item(IdOfTheItem).delete()
        
        this.handleChangesInIndexMid(0,await this.deleteIdIfExists(item.id,await this.getAllItemIdsOfContainer(ContainerIndex)))
        console.log(`Status:[deleted] item of id ${item.id}`)
    }

    /**
     * deleteIdIfExists is also a internal Method.
     * It is used to delete the ID of the Item from the Array and Update it using this,handleChangesInIndexMid()
     * 
     * @param {Number} old Old Value is the ID of the Item that is Deleted
     * @param {Array} iterable this Array containing all the ID's for the items in a container
     * @returns {Array} Array the do not contains the deleted ID for the item
     */
    async deleteIdIfExists(old,iterable){
        let temp=[]
        iterable.map((iterator)=>{
            if(iterator != old){
                temp.push(iterator)
            }
        })
        return temp
    }

}

module.exports=CollegeContacts;

    // await kpr.createDatabase()
    // await kpr.readDatabase()
    // await kpr.listAllDatabase()
    // await kpr.deleteDatabase()

    // await kpr.createContainers()         
    // await kpr.listAllContainers()
    // await kpr.scaleContainer(0,400)      
    // await kpr.deleteContainer(1)         

    // await kpr.insertDataIntoContainer(0)
    // await kpr.queryItemFromContainer()
    // await kpr.replaceItemInContainer(0)
    // await kpr.deleteItemFromContainer(0,"SchoolOfComputing-III")



