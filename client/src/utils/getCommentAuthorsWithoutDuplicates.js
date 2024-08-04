export const getCommentAuthorsWithoutDuplicates = (array) => {
    const seenUsernames = new Set();
    const result = [];

    array.forEach(item => {
        const username = item.author.username;
        if (!seenUsernames.has(username)) {
            seenUsernames.add(username);
            result.push({ ...item.author });
        }
    });

    return result;
}

export const getCommentAuthorsWithoutWinners = (array1, array2) => {
    const result = array1.filter(val => {
        return !array2.find((val2) => {
            return val.username === val2.username
        })
    });
    return result;
}