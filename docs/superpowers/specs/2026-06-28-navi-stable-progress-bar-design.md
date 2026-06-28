# Navi Stable Progress Bar Design

Date: 2026-06-28
Status: Approved design for user review

## Summary

Navi Progress Map needs a stable project-level progress bar. The current behavior can generate a different horizontal bar each time because the docs require a stage bar when stages can be inferred, but they do not define a canonical Navi stage sequence.

This design fixes the product expression: Navi should use one stable overall progress bar for the Navi project, and a separate current-stage sub-progress bar when the active stage has local work such as concerns, fixes, retests, or submission.

## Problem

Non-expert users use the Progress Map to regain orientation. If the stage names change every time, the map feels improvised and the user cannot build a stable mental model of where Navi is.

Some local work genuinely changes inside a phase. For example, during fresh-session validation, a concern may appear, leading to a small cycle of checklist repair, test assertion, retest, and commit. That local cycle should not rewrite the overall Navi project bar.

## Design

Use a two-level progress structure.

### Overall Navi Progress

The overall bar is stable:

```text
Navi 总体进度
[问题定义] -> [行为设计] -> [文档写入] -> [新会话验证] -> [真实使用校准] -> [稳定产品行为]
                                              ^
                                           当前阶段
```

Purpose:

- show where the Navi project is overall;
- preserve a stable user-facing mental model;
- avoid mixing Navi with the broader Along project;
- avoid changing stage names for temporary concerns or local fixes.

### Current-Stage Sub-Progress

When the active overall stage has meaningful local steps, add a second bar:

```text
当前阶段子进度
[发现问题] -> [修正规则/清单] -> [复测] -> [提交/记录] -> [进入下一阶段]
                              ^
                           当前小步
```

The sub-progress bar is allowed to change because it describes work inside the current stage. It should use plain-language stage names that a non-expert user can understand.

If there are no meaningful local steps, omit the sub-progress bar and explain the current stage in prose.

## Example: Current Navi Work

```text
Navi 总体进度
[问题定义] -> [行为设计] -> [文档写入] -> [新会话验证] -> [真实使用校准] -> [稳定产品行为]
                                              ^
                                           当前阶段

当前阶段子进度
[发现 checklist 缺口] -> [补 README] -> [补测试断言] -> [复测通过] -> [提交完成]
                                                                            ^
                                                                         当前小步
```

Explanation:

```text
总体位置：
Navi 已经完成问题定义、行为设计和文档写入，现在处在新会话验证阶段。

当前阶段内部：
我们发现 fresh-session checklist 漏掉两个关键 prompt，已经补 README、补测试断言、复测并提交。这个小修复完成后，下一步应回到新会话验证，看这次是否不再出现 concern。
```

## Rules

- Do not generate a new overall progress bar every time.
- Do not include Along project stages in Navi's progress bar.
- Use the stable Navi overall bar for progress and next-step orientation questions when the Navi project is the subject.
- Keep local concerns, fixes, retests, and follow-up tasks inside the current-stage sub-progress bar.
- The overall bar answers: where is the Navi project?
- The sub-progress bar answers: what is happening inside the current Navi stage?
- Every marked current position must be followed by a plain-language explanation of what that stage is doing.
- Do not use internal labels alone without translating what they mean for the user's goal.

## Non-Goals

- This design does not add a graphical UI.
- This design does not define an Along project progress bar.
- This design does not change Working Thread schema.
- This design does not add runtime, MCP, background behavior, or visual rendering.
- This design does not prove Navi product feeling; it only stabilizes the map structure to validate.

## Success Criteria

The design is successful if a non-expert user can see:

- the same overall Navi stage sequence across repeated Progress Maps;
- the current overall stage;
- any local work happening inside that stage;
- why local concerns do not change the overall project position;
- what must happen before Navi moves to the next overall stage.

It is not successful if:

- each answer invents a new overall progress bar;
- temporary concerns become new overall stages;
- Along and Navi stages are mixed together;
- the bar shows labels without explaining what the current stage means.
