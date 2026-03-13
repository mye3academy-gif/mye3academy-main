import User from "../../models/Usermodel.js";
import Attempt from "../../models/Attempt.js";
import Doubt from "../../models/Doubt.js";
import Order from "../../models/Order.js";
import MockTest from "../../models/MockTest.js";
import GrandTest from "../../models/GrandTest.js";
import bcrypt from "bcryptjs";
import sendEmail from "../../utils/sendEmail.js";

/**
 * Get Institution Statistics
 */
export const getInstitutionStats = async (req, res) => {
  try {
    const institutionId = req.user._id;

    const totalStudents = await User.countDocuments({ addedBy: institutionId, role: "student" });
    
    // Find all students for this institution to get their cumulative attempts and doubts
    const studentIds = await User.find({ addedBy: institutionId, role: "student" }).distinct("_id");

    const [totalAttempts, totalDoubts] = await Promise.all([
      Attempt.countDocuments({ studentId: { $in: studentIds } }),
      Doubt.countDocuments({ student: { $in: studentIds } }),
    ]);

    res.status(200).json({
      students: totalStudents,
      attempts: totalAttempts,
      doubts: totalDoubts,
      categoryBreakdown: [], // Reserved for future use
    });
  } catch (error) {
    console.error("Institution Stats Error:", error);
    res.status(500).json({ message: "Failed to load institution stats" });
  }
};

/**
 * Get all students added by the Institution with metrics
 */
export const getAllStudentsForInstitution = async (req, res) => {
  try {
    const institutionId = req.user._id;

    const students = await User.find({ addedBy: institutionId, role: "student" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const enrichedStudents = await Promise.all(
      students.map(async (stu) => {
        const [orderCount, attempts, doubtCount] = await Promise.all([
          Order.countDocuments({ user: stu._id, status: "successful" }),
          Attempt.find({ studentId: stu._id }).lean(), // Fetch all attempts to calculate avg
          Doubt.countDocuments({ student: stu._id }),
        ]);

        let avgScore = 0;
        const validAttempts = attempts.filter(a => (a.status === 'completed' || a.status === 'finished') && a.score !== undefined);
        
        if (validAttempts.length > 0) {
            // Need to get total marks for each test to calculate percentage
            let totalPossibleMarks = 0;
            let totalEarnedMarks = 0;

            const attemptsWithMarks = await Promise.all(validAttempts.map(async (att) => {
                let test = await MockTest.findById(att.mocktestId).select("totalMarks").lean();
                if (!test) {
                    test = await GrandTest.findById(att.mocktestId).select("totalMarks").lean();
                }
                return { ...att, totalMarks: test?.totalMarks || 0 };
            }));

            attemptsWithMarks.forEach(att => {
                if (att.totalMarks > 0) {
                    totalEarnedMarks += att.score;
                    totalPossibleMarks += att.totalMarks;
                }
            });

            if (totalPossibleMarks > 0) {
                avgScore = Math.round((totalEarnedMarks / totalPossibleMarks) * 100);
            }
        }

        return {
          ...stu,
          purchasedTestCount: orderCount,
          attemptCount: attempts.length,
          avgScore: avgScore,
          doubtCount: doubtCount,
        };
      })
    );

    res.status(200).json(enrichedStudents);
  } catch (error) {
    console.error("Institution Get All Students Error:", error);
    res.status(500).json({ message: "Failed to load students" });
  }
};

/**
 * Add a new student by the Institution
 */
export const addStudentForInstitution = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    const institutionId = req.user._id;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    let existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "Student with this email already exists" });
    }

    let hashPassword = await bcrypt.hash(password, 10);
    const avatarPath = req.file ? req.file.path : "";

    const newStudent = await User.create({
      firstname: firstName,
      lastname: lastName,
      email,
      password: hashPassword,
      phoneNumber: phone || "0000000000",
      role: "student",
      isVerified: true,
      avatar: avatarPath,
      addedBy: institutionId,
      registrationSource: "institution",
    });

    // Send notification email
    try {
      const subject = `Welcome - Student Account Created by ${req.user.firstname}`;
      const text = `Hello ${firstName},\n\nYour student account has been successfully created.\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${password}\n\nBest Regards,\nMye3 Academy`;
      await sendEmail(email, subject, text);
    } catch (emailError) {
      console.error("Failed to send credential email:", emailError);
    }

    const { password: _, ...studentData } = newStudent.toObject();
    res.status(201).json({ message: "Student added successfully", student: studentData });
  } catch (error) {
    console.error("Institution Add Student Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get student activity (for performance tracking)
 */
export const getStudentActivityForInstitution = async (req, res) => {
  try {
    const studentId = req.params.id;
    const institutionId = req.user._id;

    // Verify ownership
    const student = await User.findOne({ _id: studentId, addedBy: institutionId });
    if (!student) return res.status(403).json({ message: "Access denied" });

    const [orders, rawAttempts, doubts] = await Promise.all([
      Order.find({ user: studentId, status: "successful" }).sort({ createdAt: -1 }).lean(),
      Attempt.find({ studentId: studentId }).sort({ createdAt: -1 }).lean(),
      Doubt.find({ student: studentId }).populate("assignedInstructor", "firstname lastname").sort({ createdAt: -1 }).lean(),
    ]);

    // Manually populate doubts to handle both test collections
    const enrichedDoubts = await Promise.all(doubts.map(async (d) => {
        let test = await MockTest.findById(d.mocktestId).select("title").lean();
        if (!test) {
            test = await GrandTest.findById(d.mocktestId).select("title").lean();
        }
        return {
            ...d,
            mocktestId: test || { title: "Test Information Unavailable" }
        };
    }));

    // Manually populate attempts to handle both MockTest and GrandTest collections
    const attempts = await Promise.all(rawAttempts.map(async (att) => {
        let test = await MockTest.findById(att.mocktestId).select("title totalMarks").lean();
        if (!test) {
            test = await GrandTest.findById(att.mocktestId).select("title totalMarks").lean();
        }
        return {
            ...att,
            mocktestId: test || { title: "Deleted Test", totalMarks: 0 }
        };
    }));

    // Manually populate order items to handle both MockTest and GrandTest collections
    const purchasedTests = (await Promise.all(orders.map(async (o) => {
        if (!o.items || !Array.isArray(o.items)) return [];
        
        const enrichedItems = await Promise.all(o.items.map(async (itemId) => {
            // Attempt to find in MockTest
            let item = await MockTest.findById(itemId).select("title").lean();
            if (!item) {
                // Attempt to find in GrandTest
                item = await GrandTest.findById(itemId).select("title").lean();
            }
            return item || { title: "Archived/Deleted Material" };
        }));

        return enrichedItems.map(i => ({
            title: i.title,
            date: o.createdAt,
            orderId: o.razorpay?.order_id || "N/A",
            paymentId: o.razorpay?.payment_id || "N/A",
            amount: (o.amount || 0)
        }));
    }))).flat();

    res.status(200).json({
      purchasedTests,
      attempts,
      doubts: enrichedDoubts
    });
  } catch (error) {
    console.error("Institution Get Activity Error:", error);
    res.status(500).json({ message: "Failed to fetch student activity" });
  }
};
