import List "mo:core/List";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

actor {
  public type Category = {
    #MCQ;
    #Marks2;
    #Marks4;
    #Marks6;
    #Marks8;
  };

  public type Difficulty = {
    #Easy;
    #Medium;
    #Hard;
  };

  public type Question = {
    id : Nat;
    subjectId : Nat;
    questionText : Text;
    category : Category;
    difficulty : Difficulty;
    options : [Text];
    correctOption : ?Nat;
  };

  public type Subject = {
    id : Nat;
    name : Text;
    code : Text;
    description : Text;
  };

  public type Section = {
    category : Category;
    questions : [Question];
  };

  public type Paper = {
    id : Nat;
    subjectId : Nat;
    examDuration : Text;
    totalMarks : Nat;
    sections : [Section];
    setLabel : Text;
    createdAt : Time.Time;
  };

  var nextSubjectId = 1;
  var nextQuestionId = 1;
  var nextPaperId = 1;

  let subjects = Map.empty<Nat, Subject>();
  let questions = Map.empty<Nat, Question>();
  let papers = Map.empty<Nat, Paper>();

  // Initialize with pre-seeded subjects
  public shared ({ caller }) func init() : async () {
    let subjectNames = [
      ("Discrete Mathematics", "DM101"),
      ("Operating System", "OS102"),
      ("Microprocessor", "MP103"),
      ("Data Structures", "DS104"),
      ("Computer Networks", "CN105"),
      ("Database Management Systems", "DB106"),
      ("Theory of Computation", "TOC107"),
      ("Digital Electronics", "DE108"),
      ("Computer Architecture", "CA109"),
      ("Software Engineering", "SE110"),
    ];

    for ((name, code) in subjectNames.values()) {
      let subject : Subject = {
        id = nextSubjectId;
        name;
        code;
        description = "This is the description for " # name # ".";
      };
      subjects.add(nextSubjectId, subject);
      nextSubjectId += 1;
    };
  };

  // Subject CRUD operations
  public query ({ caller }) func getAllSubjects() : async [Subject] {
    subjects.values().toArray();
  };

  public shared ({ caller }) func addSubject(name : Text, code : Text, description : Text) : async Nat {
    let subject : Subject = {
      id = nextSubjectId;
      name;
      code;
      description;
    };
    subjects.add(nextSubjectId, subject);
    let id = nextSubjectId;
    nextSubjectId += 1;
    id;
  };

  public shared ({ caller }) func updateSubject(id : Nat, name : Text, code : Text, description : Text) : async () {
    switch (subjects.get(id)) {
      case (null) { Runtime.trap("Subject not found") };
      case (?_) {
        let updated : Subject = {
          id;
          name;
          code;
          description;
        };
        subjects.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteSubject(id : Nat) : async () {
    if (not subjects.containsKey(id)) {
      Runtime.trap("Subject not found. ");
    };
    subjects.remove(id);
  };

  // Question CRUD operations
  public query ({ caller }) func getAllQuestions() : async [Question] {
    questions.values().toArray();
  };

  public shared ({ caller }) func addQuestion(subjectId : Nat, questionText : Text, category : Category, difficulty : Difficulty, options : [Text], correctOption : ?Nat) : async Nat {
    let question : Question = {
      id = nextQuestionId;
      subjectId;
      questionText;
      category;
      difficulty;
      options;
      correctOption;
    };
    questions.add(nextQuestionId, question);
    let id = nextQuestionId;
    nextQuestionId += 1;
    id;
  };

  public shared ({ caller }) func updateQuestion(id : Nat, subjectId : Nat, questionText : Text, category : Category, difficulty : Difficulty, options : [Text], correctOption : ?Nat) : async () {
    switch (questions.get(id)) {
      case (null) { Runtime.trap("Question not found") };
      case (?_) {
        let updated : Question = {
          id;
          subjectId;
          questionText;
          category;
          difficulty;
          options;
          correctOption;
        };
        questions.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteQuestion(id : Nat) : async () {
    if (not questions.containsKey(id)) {
      Runtime.trap("Question not found. ");
    };
    questions.remove(id);
  };

  public shared ({ caller }) func generatePaper(subjectId : Nat, examDuration : Text, totalMarks : Nat, numOfQuestionsPerCategory : [(Category, Nat)]) : async Nat {
    let filteredQuestions = questions.filter(
      func(_, q) { q.subjectId == subjectId }).values().toArray();

    let paperSections : [Section] = numOfQuestionsPerCategory.map(
      func((cat, numQs)) {
        let categoryQuestions = filteredQuestions.filter(
          func(q) { q.category == cat }
        ).values().take(numQs).toArray();

        {
          category = cat;
          questions = categoryQuestions;
        };
      }
    );

    let paper : Paper = {
      id = nextPaperId;
      subjectId;
      examDuration;
      totalMarks;
      sections = paperSections;
      setLabel = "A";
      createdAt = Time.now();
    };

    papers.add(nextPaperId, paper);
    let id = nextPaperId;
    nextPaperId += 1;
    id;
  };
};
