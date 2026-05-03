Let's build a MacOS desktop app for reading manhawas.

The name of the app is "Manhawa Reader" (provisory).

This is a brand new project and fresh git repository. Create all the necessary files and folders for the project, such as (but not limited to) `.gitignore`, `README.md`, `CLAUDE.md`, `.editorconfig`, `.tool-versions`, etc.

## Requirements

1. I should be able to import a manhawa into my collection by picking a folder on my computer.
  1.1. The directory picker should only allow picking folders, not files.
2. The manhawa's name is the same name of its folder by default, but I should be able to change it.
3. I manhawa has many chapters, see the section "File Structure" below for more details.
4. I should be able to open a manhawa in my collection to see its contents and info.
5. When I open a manhawa:
  5.1. I should see the reading progress (e.g. "50% (100/200)"). Watch out for color contrast when text is rendered on top of the progress bar.
  5.2. I should see a list of its chapters:
    5.2.1. Each chapter should have a name, see "File Structure" below for more details.
    5.2.2. Chapters should be ordered by their file name ascending.
    5.2.3. Clicking on a chapter's name should open the chapter in read view (see requirement #6).
    5.2.4. I should be able to mark a chapter as read or unread:
      5.2.4.1. When I click on a chapter row, it should clear any selection and then mark the row as selected.
      5.2.4.2. If a row is already selected and I click on it again (without holding CMD/CTRL), it should become unselected.
      5.2.4.3. If I hold SHIFT then click on another row, all the rows between the previously selected row and the one I just clicked on should become selected.
      5.2.4.4. I can hold CMD (or CTRL) to cherry-pick-select rows. While holding CMD/CTRL, If I click on a row that's already selected it should become unselected.
      5.2.4.5. There should be a visual indicator on selected rows.
      5.2.4.6. If at least 2 rows are selected, a bottom floating navbar should appear with buttons to "mark as read" and "mark as unread". If one of these actions are either unavailable or not applicable, its button should be disabled/muted. Make sure this navbar doesn't cover the last chapter row, otherwise it would be hard to select it.
    5.2.5. There should be a way to visually identify which chapters I have read and which I haven't.
  5.3. There should be a button that takes the user to the next unread chapter:
    5.3.1. If there no read chapters yet, render a "start reading" button that takes the user to the first chapter.
    5.3.2. If all chapters are read, render a "re-read" button that deletes the reading progress and then takes the user to the first chapter.
6. There should be a read view for reading a chapter.
  6.1. It should be VERY minimalistic, with no distractions.
  6.2. The view should have enough space to fit 1 page of a chapter's PDF file.
  6.3. I should be able to scroll vertically to see the next page.
  6.4. There MUST NOT be any horizontal scrolling.
  6.5. At the top of the view, there should be a floating, semi-transparent navigation bar with the following elements:
    6.5.1. On the left side, a button to the previous chapter (if there's one, otherwise it should be muted).
    6.5.2. In the middle, the manhawa's name and the chapter's name. The manhawa's name should be a link back to the manhawa's info view.
    6.5.3. On the right side, a button to the next chapter (if there's one, otherwise it should be muted).
  6.6. The navigation bar should only be visible when the user moves the mouse, and it should disappear after 3 seconds of inactivity.
  6.7. At the very bottom of the view, below the last page, there should be a button that marks the chapter as read and takes the user to the next chapter. If the rendered chapter is the last one, it should take the user back to the manhawa's info view.
7. On the manhawa's info view, there should be an icon button shaped as a gear that opens a settings menu for that manhawa where I can:
  7.1. Change the manhawa's name.
  7.2. Reset the reading progress (requires user confirmation).
  7.3. Remove the manhawa from my collection (should delete everything related to that manhawa from the database). Removing the manhawa from the collection should be considered a "dangerous action", therefore it should require user confirmation. The message should emphasize that the manhaw's directory (the one with the chapters and all) will NOT be deleted, only the reading progress will be lost.

## File Structure

A manhawa is a folder in the user's file system that has the following structure:

```
├─ Solo Leveling
│  ├─ 000 - Prologue.pdf      # 000 is the chapter number, "Prologue" is the chapter name
│  ├─ 001.pdf                 # 001 is the chapter number and there's no chapter name, so fallback to "Chapter 1" as its name
│  ├─ 002.pdf                 # use "Chapter 2" as its name
│  ├─ ...
│  ├─ 180 - Side Story 1.pdf  # 180 is the chapter number, "Side Story 1" is the chapter name
```

It is guaranteed that the files are named in a sort-safe way, meaning that sorting them by their file name in ascending order will always give the correct chapter order.

## Stack

Use whatever stack you think is best for this project.

If you choose to use javascript/typescript, prefer using Bun if possible.

Use `asdf-vm` to manage your development dependencies (such as `Bun`, `Node`, `Rust`, etc).

If you need to use environment variables (although I don't see why you'd need it), create an `.envrc` file to be used with `direnv`. Make sure to create an `.envrc.sample` file with sample environment variables and instructions on how to use it.

You will need to store data like (but not limited to):
- The manhawas in the user's collection; and
- The chapters of each manhawa, with their number, name, read/unread status, path to the PDF file, etc.
You can store this data however you want (e.g. JSON files, SQLite database, plain files in the file system, etc). Such "database" should be stored under in the user's home directory, e.g. `/Users/${USER}/Documents/Manhawa Reader/.data/`.
