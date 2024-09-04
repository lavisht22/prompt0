// Function to add a new evaluation to the list of evaluations and return the updated list
export function addEvaluation(
    currentEvaluations: Evaluation[],
    newEvaluation: Evaluation,
) {
    const existingEvaluationIdx = currentEvaluations.findIndex((evaluation) => {
        return JSON.stringify(evaluation.variables) ===
            JSON.stringify(newEvaluation.variables);
    });

    if (existingEvaluationIdx !== -1) {
        currentEvaluations[existingEvaluationIdx] = newEvaluation;
    } else {
        currentEvaluations.push(newEvaluation);
    }

    return currentEvaluations;
}

// This function copies and filters evaluations based on a new set of variables
export function copyEvaluations(
    prevEvaluations: Evaluation[],
    variables: Map<string, string>,
) {
    const variableKeys = Array.from(variables.keys());

    // Filter evaluations to only include those that have all the new variables
    const filteredEvaluations = prevEvaluations.filter((evaluation) => {
        return variableKeys.every((variable) =>
            Object.keys(evaluation.variables).includes(variable)
        );
    });

    // Map over the filtered evaluations to create new evaluation objects
    return filteredEvaluations.map((evaluation) => {
        return {
            // Only include variables that are in the new set of variables
            variables: Object.fromEntries(
                Object.entries(evaluation.variables).filter(([key]) =>
                    variableKeys.includes(key)
                ),
            ),
            response: null, // Reset the response
            created_at: new Date().toISOString(), // Set a new creation date
        };
    });
}
