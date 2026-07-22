module.exports = function handler(req, res) {
  res.status(200).json({
    summary: {
      activeStudents: 0,
      allLessons: 0,
      plannedLessons: 0,
      newLeads: 0,
      paidTotal: 0,
      nextLessons: []
    },
    students: [],
    lessons: [],
    payments: [],
    leads: []
  });
};
