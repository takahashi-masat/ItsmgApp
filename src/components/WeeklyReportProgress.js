import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostsContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/weeklyProgress.css';

const WeeklyReportProgress = () => {
  const { isAdmin } = useAuth();
  const { posts } = usePosts();
  const [progress, setProgress] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [submittedUsers, setSubmittedUsers] = useState(0);

  useEffect(() => {
    const calculateProgress = async () => {
      try {
        // 会員登録可能メールアドレスの総数を取得
        const allowedEmailsRef = collection(db, 'allowedEmails');
        const allowedEmailsSnap = await getDocs(allowedEmailsRef);
        const totalAllowedEmails = allowedEmailsSnap.size;
        setTotalUsers(totalAllowedEmails);

        // 投稿があるユーザーを集計（返信は除外）
        const uniqueUsers = new Set();
        posts.forEach(post => {
          if (!post.isReply) {
            uniqueUsers.add(post.userId);
          }
        });

        const submittedCount = uniqueUsers.size;
        setSubmittedUsers(submittedCount);

        // 進捗率を計算
        const progressPercentage = totalAllowedEmails > 0
          ? Math.round((submittedCount / totalAllowedEmails) * 100)
          : 0;
        setProgress(progressPercentage);

      } catch (error) {
        console.error('進捗率の計算中にエラーが発生しました:', error);
      }
    };

    if (isAdmin) {
      calculateProgress();
    }
  }, [isAdmin, posts]);

  if (!isAdmin) return null;

  return (
    <div className="weekly-progress">
      <div className="weekly-progress-header">
        <h3>週報記載率</h3>
      </div>
      <div className="progress-label">
        週報記載率: {progress}% ({submittedUsers}/{totalUsers})
      </div>
      <div className="progress-bar">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default WeeklyReportProgress; 