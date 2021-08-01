import type { NextApiResponse } from 'next'
import { withSession, withAuth, NextApiSessionRequest, createOAuth2 } from '@/shared/api'
import { ClassroomCredentials } from './callback'
import { APIResponse } from '@/types/classroom'
import admin from '@/shared/firebase-admin'

const deAuthorize = async (
  req: NextApiSessionRequest,
  res: NextApiResponse<APIResponse>
): Promise<void> => {
  const uid = req.session.get('uid')
  const classroom = req.query.classroom.toString()
  if (!classroom || !uid || req.method != 'GET') return res.status(400).send({ success: false })
  const tokens: ClassroomCredentials[] = req.session.get('token')
  const _tokens = tokens.filter((t) => t.id === classroom)
  if (_tokens.length !== 1) return res.status(404).send({ success: false })
  try {
    // Revoke the token.
    const oAuth2Client = createOAuth2(req)
    oAuth2Client.revokeToken(_tokens[0].access_token)
    // Remove the refresh token from the database.
    const db = admin.firestore()
    await db.collection('users').doc(uid).collection('classroom').doc(_tokens[0].id).delete()
    // Get all coursework item with the given accountId and remove it.
    const batch = db.batch()
    const work = await db
      .collection('users')
      .doc(uid)
      .collection('classwork')
      .where('accountId', '==', _tokens[0].id)
      .get()
    work.docs.map((w) => {
      batch.delete(w.ref)
    })
    await batch.commit()
    // Saves the token but without the deleted account.
    req.session.set(
      'token',
      tokens.filter((t) => t.id !== classroom)
    )
    await req.session.save()
    return res.status(200).send({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).send({ success: false })
  }
}

export default withSession(withAuth(deAuthorize))
