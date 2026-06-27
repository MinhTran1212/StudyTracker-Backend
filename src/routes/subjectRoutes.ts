import { Router } from 'express';
import { Subject } from '../models/Subject';
import mongoose  from 'mongoose';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

//creating a subject
router.post('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const subjectName = req.body.name;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const newSubject = await Subject.create({
            name: subjectName,
            userId: new mongoose.Types.ObjectId(userId) as any
        });

        res.status(201).json(newSubject);
    } catch (error) {
        console.error("Failed to create subject:", error);
        res.status(500).json({ error: 'Server failed to save subject' });
    }
}); 

//get all subjects
router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.find().select("name topics");

        res.status(201).json(subjects);
    } catch (error){
        console.log("There is a error.");
        console.error(error);
        res.status(500).send("Currently there is an error.");
    }
});

router.put('/:id/topics', async (req, res)=> {
    try {
        const id = req.params.id;
        const  name  = req.body.topicName;
        
        const updatedSubject = await Subject.findByIdAndUpdate(id,
            {
                $push: {
                    topics: { topicName: name, isCompleted: false }
                }
            },
            { returnDocument: 'after' }
         );

        if (!updatedSubject) {
            console.log("Null Pointer");
            return res.status(404).json({ error: 'Subject not found'});
        }
        res.status(200).json(updatedSubject);
    } catch (error) {
        console.error(error);
        res.status(500).send(`There's a error. Failed to update the topic.`);
    }
})

router.delete('/:id/topics/:topicId', async (req, res) => {
    try {
        const id = req.params.id;
        const id2 = req.params.topicId;
        const name = req.body;

        const newSubject = await Subject.findByIdAndUpdate(id,
            {
                $pull: {
                    topics: {_id: id2} 
                },
            },
            { new: true }
        );

        if (!newSubject){
            console.log("Not found subject");
            return res.status(404).json({error: 'Subject not found'});
        }

        res.status(200).json(newSubject);
    } catch (error){
        console.error(error);
    }
});


export default router;