export class AnswerPositions {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export class MCQAnswer {
    answerId: number;
    answerValue: string;
    isCorrect: boolean;
}

export class AnswerPositionsDDQ extends AnswerPositions {
    imagePath?: string;
    label?: string
}

export class DeviceQuestionInfo {
    imagePaths: string[];
    correctPositions?: AnswerPositions[];
    incorrectPositions?: AnswerPositions[];
    ddqPositions?: AnswerPositionsDDQ[];
}