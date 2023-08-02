const { exec } = require('child_process');
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors'); 
const multer = require('multer');
var zipper = require("zip-local");
const ZipLocal = require('zip-local');
const crypto = require('crypto');
const path = require('path');




// const storage = multer.diskStorage({
//   destination : function(req,file,callback){
//     callback(null,'uploads/')
//   },
//   filename: function(req,file,callback){
//     callback(null,file.originalname)
//   }
// })


const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads/');
  },
  filename: function (req, file, callback) {
    crypto.randomBytes(16, (err, buf) => {
      if (err) return callback(err);

      const randomFilename = buf.toString('hex') + path.extname(file.originalname);
      callback(null, randomFilename);
    });
  },
});

const upload = multer({ storage:storage });

const app = express();
app.use(cors()); // Enable CORS for all routes

app.use(express.json()); // Parse JSON request bodies

let systems

app.post('/api/upload', upload.array(`file`,3), (req, res) => {
  // Handle the uploaded file here
  
  const filename = req.files.map(file => file.filename);
  
  const resposnse = {
    filename:filename
  }

  // res.send('File uploaded successfully');
  res.send(resposnse)
});

app.post('/api/download',(req,res)=>{

  const { uid } = req.body; 

  function generateSystemAlignmentPath(dynamicPart) {
    const staticPath = `D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_kgas/results/${uid}/`;
    const systemAlignmentFilename = "systemAlignment.rdf";
    const dynamicPath = `${staticPath}LocalTrack_1.0/Local+TC/D%3A%2FCITYUNI_CPP%2Fterm_2%2Findividul_project%2Ffinal_DEV%2Fmelt_kgas%2Fmatchers%2F${dynamicPart}/`;
  
    return dynamicPath + systemAlignmentFilename;
  }

  res.download(generateSystemAlignmentPath(systems))

})

app.post('/api/melt', (req, res) => {

    const {localTestcase1,localTestcase2,localreference} = req.body;
    systems = req.body.systems;

    const uniqueId = crypto.randomBytes(16).toString('hex'); // 16 bytes creates a 32-character hexadecimal string
    const resultfile = `${uniqueId}`
    const cmdfile = `${uniqueId}.txt`

    const staticPart = 'java -jar "D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_kgas/matching-eval-client-latest.jar"';
    const systemsPart = `--systems "D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_kgas/matchers/"${systems}""`;
    const localTestcasePart1 = `--local-testcase "D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_kgas/uploads/"${localTestcase1}""`;
    const localTestcasePart2 = ` "D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_kgas/uploads/"${localTestcase2}""`;
    const referencePart = `"D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_kgas/uploads/"${localreference}""`;
  
    const command = `${staticPart} ${systemsPart} ${localTestcasePart1} ${localTestcasePart2} ${referencePart} > D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_kgas/cmd_output/${cmdfile} --results "D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_kgas/results/${resultfile}" `;
  
  console.log(command);
    
  


//   const command = 'java -jar "D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_client/matching-eval-client-latest.jar" --systems "D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_client/matchers/alod2vecmatcher-1.0-web-latest.tar.gz" --local-testcase "D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_client/datasets/anatomy-dataset/human.owl" "D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_client/datasets/anatomy-dataset/mouse.owl" "D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_client/datasets/anatomy-dataset/reference.rdf"';

  // Increase the max buffer size to 50MB (50 * 1024 * 1024 bytes)
  const maxBuffer = 50 * 1024 * 1024;

  const childProcess = exec(command, { maxBuffer });

  // Send an immediate response to the client indicating that the request has been received

  // Listen for stdout data
  childProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  // Listen for stderr data
  childProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  childProcess.on('error', (error) => {
    console.error(`Child process error: ${error.message}`);
  });

  // Listen for process completion
  childProcess.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
    // Process completed, send the final response
    res.send(resultfile)
  });
});

app.post("/api/output",(req,res)=>{

    const { email } = req.body;
    const {uid} = req.body;

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'mahinvrajput999@gmail.com',
          pass: 'dpvsnjodehondwsx'
        }
      });
      
      function generateSystemAlignmentPath(dynamicPart) {
        const staticPath = `D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_kgas/results/${uid}/`;
        const systemAlignmentFilename = "systemAlignment.rdf";
        const dynamicPath = `${staticPath}LocalTrack_1.0/Local+TC/D%3A%2FCITYUNI_CPP%2Fterm_2%2Findividul_project%2Ffinal_DEV%2Fmelt_kgas%2Fmatchers%2F${dynamicPart}/`;
      
        return dynamicPath + systemAlignmentFilename;
      }

      var mailOptions = {
        from: 'mahinvrajput999@gmail.com',
        to: `${email}`,
        subject: 'Alignment',
        text: `This is an alignment sent using MELT_KGAS and your UID is ${uid}`,
        attachments: [{
            filename: `${uid}.txt`,
            path: `D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_kgas/cmd_output/${uid}.txt`
        },{
          filename:`alignmentCube.csv`,
          path:`D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_kgas/results/${uid}/alignmentCube.csv`
        },{
          filename:`testCasePerformanceCube.csv`,
          path:`D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_kgas/results/${uid}/testCasePerformanceCube.csv`
        },{
          filename:`trackPerformanceCube.csv`,
          path:`D:/CITYUNI_CPP/term_2/individul_project/final_DEV/melt_kgas/results/${uid}/trackPerformanceCube.csv`
        },{
          filename:`systemAlignment.rdf`,
          path: generateSystemAlignmentPath(systems)
        }
      ]

      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Sent' + info.response);
          res.end("email sent")
        }
      });
      

})

// Start the server
app.listen(80, () => {
  console.log('Server is running on port 80');
});
