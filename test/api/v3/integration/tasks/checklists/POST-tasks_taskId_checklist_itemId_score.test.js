import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /tasks/:taskId/checklist/:itemId/score', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('scores a checklist item', async () => {
    let task = await user.post('/tasks', {
      type: 'daily',
      text: 'Daily with checklist',
    });

    let savedTask = await user.post(`/tasks/${task._id}/checklist`, {
      text: 'Checklist Item 1',
      completed: false,
    });

    savedTask = await user.post(`/tasks/${task._id}/checklist/${savedTask.checklist[0]._id}/score`);

    expect(savedTask.checklist.length).to.equal(1);
    expect(savedTask.checklist[0].completed).to.equal(true);
  });

  it('fails on habits', async () => {
    let habit = await user.post('/tasks', {
      type: 'habit',
      text: 'habit with checklist',
    });

    await expect(user.post(`/tasks/${habit._id}/checklist/${generateUUID()}/score`, {
      text: 'Checklist Item 1',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on rewards', async () => {
    let reward = await user.post('/tasks', {
      type: 'reward',
      text: 'reward with checklist',
    });

    await expect(user.post(`/tasks/${reward._id}/checklist/${generateUUID()}/score`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on task not found', async () => {
    await expect(user.post(`/tasks/${generateUUID()}/checklist/${generateUUID()}/score`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });

  it('fails on checklist item not found', async () => {
    let createdTask = await user.post('/tasks', {
      type: 'daily',
      text: 'daily with checklist',
    });

    await expect(user.post(`/tasks/${createdTask._id}/checklist/${generateUUID()}/score`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('checklistItemNotFound'),
    });
  });
});
