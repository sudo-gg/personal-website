from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
import numpy as np

rng = np.random.default_rng(0)
X = rng.integers(0, 2, size=(300, 4))
y = ((X.sum(axis=1) + rng.integers(0, 2, 300)) >= 3).astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=0
)

model = XGBClassifier(
    n_estimators=10,
    max_depth=2,
    learning_rate=0.3,
    objective="binary:logistic",
    eval_metric="logloss",
)

model.fit(X_train, y_train)
print("toy accuracy", model.score(X_test, y_test))